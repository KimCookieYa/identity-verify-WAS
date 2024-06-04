import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IModalStore {
    isModalOpen: boolean;
    content?: React.ReactNode;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
}

export const useModalStore = create<IModalStore>((set) => ({
    isModalOpen: false,
    content: undefined,
    openModal: (content) => set(() => ({ isModalOpen: true, content })),
    closeModal: () => set(() => ({ isModalOpen: false })),
}));
