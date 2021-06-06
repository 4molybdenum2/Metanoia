import React, { useCallback, useMemo, useState,useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'
import io from "socket.io-client";

import {IconButton} from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

import { Button, Icon, Toolbar } from './formatComponents';
const socket = io("http://localhost:4000");


interface Props {
    docId: string;
}

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

export const SyncingEditor: React.FC<Props> = ({docId}) => {
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  // const editor = useMemo(() => withHistory(withReact(createEditor() as any)), [])
  const editor = useMemo(() => withHistory(withReact(createEditor() as any)), [])

  const [docName, setDocName] = useState<string>("");

  const [saved, setSaved] = useState<boolean>(true);

  const remote = useRef(false);
  const socketchange = useRef(false);
  let history = useHistory();

  useEffect(() => {
    const getNoteData = async() =>{
      const data = await fetchNoteData();
      if(data.success){
        setValue(data.data.contents);
        setDocName(data.data.docName);
      }
      else{
        history.push('/');
      }
    }
    getNoteData();
    
    socket.emit('join', docId);

    socket.on(`text-changed`, ({ops}) => {
      remote.current = true;
      console.log(ops);
      Editor.withoutNormalizing(editor, ()=>{
        JSON.parse(ops).forEach((op: any) => editor.apply(op));
      })
      remote.current = false;
      socketchange.current = true;
    });

    socket.on(`failed`,()=>{
      console.log('failed');
    });

    return () => {
      socket.off(`text-changed`);
      socket.off(`failed`);
    };
  }, [docId]);

  const fetchNoteData = async () =>{
    const res = await fetch(`http://localhost:4000/document/${docId}`,
    {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    return data;
  }
  
  const saveDoc = async ()=>{
    socket.emit("save", {
      newText: value,
      docId,
    });
    setSaved(true);
  }

  return (
    <>
    <div className="container">
    <div className="note-header">
      {docName}
      <IconButton onClick={()=>saveDoc()}><Save/></IconButton>
    </div>
    {
    saved ? null : <Alert severity="warning">Note is not saved!</Alert>  
    }
    
    <br></br><br></br>
    <Slate editor={editor} value={value} onChange={value => {
        setValue(value);
        const ops = editor.operations
        .filter( o => {
          if(o){
            return o.type !== "set_selection" &&
                  o.type !== "set_value"
          }
          return false;
        });
        if (ops.length && !remote.current && !socketchange.current) {
          setSaved(false);
          socket.emit("text-changed", {
            newText: value,
            docId,
            ops: JSON.stringify(ops)
          });
        }
        socketchange.current = false;
      }
      }>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onMouseDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }
      }
      />
    </Slate>
    </div>
    </>
  )
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type
      ),
    split: true,
  })
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  } as any;
  
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
  })

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue: any = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export default SyncingEditor