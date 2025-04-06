import { atom } from "recoil";

export const userNameAtom = atom<string>({
  key: "userNameAtom",
  default: "", // No sessionStorage involved
});

export const roomIdAtom = atom<string>({
  key: "roomIdAtom",
  default: "",
});
