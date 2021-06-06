import React, {useContext} from "react";
import { RouteComponentProps } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { SyncingEditor } from "./SyncingEditor";
import { IUser } from '../types/User';

// pass props to Syncing Editor...
export const NoteEditor: React.FC<RouteComponentProps<{ id: string }>> = ({
  match: {
    params: { id }
  }
}) => {

  const user = useContext(UserContext) as IUser;

  return (
    <>
      {user ?
        <SyncingEditor docId={id}/>
        :
        <p>Unauthorized</p>
      }
    </>
  );
};
