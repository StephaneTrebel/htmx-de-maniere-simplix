import { TError } from "@/app/api/(auth)/login/interfaces/error";

export type TState = {
    loading: boolean,
    isError: boolean,
    errors: TError,
}