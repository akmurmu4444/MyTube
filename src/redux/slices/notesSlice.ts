import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VideoNote {
  id: string;
  videoId: string;
  content: string;
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: VideoNote[];
}

const initialState: NotesState = {
  notes: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<{ videoId: string; content: string; timestamp?: number }>) => {
      const note: VideoNote = {
        id: Date.now().toString(),
        videoId: action.payload.videoId,
        content: action.payload.content,
        timestamp: action.payload.timestamp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.notes.push(note);
    },
    updateNote: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      const note = state.notes.find(n => n.id === id);
      if (note) {
        note.content = content;
        note.updatedAt = new Date().toISOString();
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload);
    },
  },
});

export const { addNote, updateNote, deleteNote } = notesSlice.actions;

export default notesSlice.reducer;