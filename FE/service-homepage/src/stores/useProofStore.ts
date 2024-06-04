import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface IProofStore {
    proof: string;
    setProof: (proof: string) => void;
    holderPubKey: string;
    issuerPubKey: string;
    setHolderPubKey: (holderPubKey: string) => void;
    setIssuerPubKey: (issuerPubKey: string) => void;
}

export const useProofStore = create(
    persist<IProofStore>(
        (set, get) => ({
            proof: '',
            setProof: (proof: string) => {
                set({ proof });
            },
            holderPubKey: '',
            issuerPubKey: 'wakeful-cave.testnet',
            setHolderPubKey: (holderPubKey: string) => {
                set({ holderPubKey });
            },
            setIssuerPubKey: (issuerPubKey: string) => {
                set({ issuerPubKey });
            },
        }),
        {
            name: 'paperboat-proof', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
