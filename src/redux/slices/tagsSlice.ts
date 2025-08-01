import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TagsState {
  tags: string[];
}

const initialState: TagsState = {
  tags: ['Technology', 'Education', 'Entertainment', 'Music', 'Tutorial'],
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag !== action.payload);
    },
    updateTag: (state, action: PayloadAction<{ oldTag: string; newTag: string }>) => {
      const { oldTag, newTag } = action.payload;
      const tagIndex = state.tags.findIndex(tag => tag === oldTag);
      if (tagIndex !== -1) {
        state.tags[tagIndex] = newTag;
      }
    },
  },
});

export const { addTag, removeTag, updateTag } = tagsSlice.actions;

export default tagsSlice.reducer;