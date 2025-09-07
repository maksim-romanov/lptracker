export const formatAddress = (addr: string) => addr.replace(/^(0x)?(.{4}).+(.{4})$/, "$1$2…$3");
