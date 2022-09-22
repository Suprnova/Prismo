import { writable } from "svelte/store";

export const backupDir = writable('data_old');