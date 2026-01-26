import { toast } from "sonner";

export const toastBus = {
  success: (msg: string) => msg && toast.success(msg),
  error: (msg: string) => msg && toast.error(msg),
  warning: (msg: string) => msg && toast.warning(msg),
  info: (msg: string) => msg && toast(msg),
};
