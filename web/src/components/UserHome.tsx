import React,{useState,useEffect,useContext} from 'react';
import { UserContext } from '../context/UserContext';
import { IUser } from '../types/User';
import {Button,Dialog,DialogTitle,DialogContent,TextField, DialogActions} from '@material-ui/core';
import { NoteCard } from './NoteCard';

export const UserHome: React.FC = () => {

    const user = useContext(UserContext) as IUser;

    const [notes, setNotes] = useState<any>([]);

    const [noteName, setNoteName] = useState<string>("");

    //----------Modal State------------------
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const handleSubmit = () =>{
      setOpen(false);
      createNote(noteName);
    }
    //---------------------------------------
    const getNotes = async() =>{
      const notesFromServer = await fetchNotes();
      setNotes(notesFromServer.data.length ? notesFromServer.data: null);
    }

    

    // asynchronous fetch function
    const fetchNotes = async () =>{
      const res = await fetch('http://localhost:4000/document',
      {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      return data;
    }

    //function to create a new note
    const createNote = async (noteName) => {
      const res = await fetch('http://localhost:4000/document/create',
      {
        method: 'POST',
        credentials: "include",
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({docName: noteName})
      });
      const newNote = await res.json();
      setNotes([...notes, newNote.data]);
    }

    // EFfect to get all the notes in the db
    useEffect(() => {
      getNotes();
      // console.log(value.authenticated)
    }, [user, notes]);

    
    return (
      <div className="container">
        <div>
            {user ?
            (<>
            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                Create Note
              </Button>
              <Dialog 
              open={open}
              onClose={handleClose}
              >
                <DialogTitle id="alert-dialog-title">{"Create a Note: "}</DialogTitle>
                <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  id="note-name"
                  label="Note Name"
                  type="note"
                  fullWidth
                  onChange = {e => setNoteName(e.target.value)}
                />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} color="primary" autoFocus>
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
              <br></br>
              <br></br>
              <div>
                {
                notes.map((note) =>
                      <NoteCard note={note}/>
                )}
              </div>
            </>)
              :
              (
                
            <div> 
              <p>
                Metanoia is a realtime collaborative editor. Create a Note , Add a collaborator and watch your changes in real time! <br></br>
                Its just that simple!
                </p>
                <img src="/collaboration.webp"/>
            </div>
              )
            }
        </div>
      </div>
    );

    type NoteCardProps = {
      title: string,
    }
  };