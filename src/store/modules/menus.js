import { defineStore } from "pinia";
export const useMenusStore = defineStore({
    id: "menus",
    state: () => ({
        menus: [],
    }),
    actions: {
        setMenus(menus) {
            this.menus = menus;
        },
    },
});
