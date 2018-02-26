/**
 * Proposal: необходимо чуть более нормально хранить начальные цвета,
 * используемые для отображения различных состояний слов/событий/связей/...
 * 
 * Собственно, почему бы не сделать это так же, как в cgraph? Да и править проще...
 */

var g_colors = {

    Node : { value: 0xFFFF009F, code: 0 },

    NodeHighlighted : { value: 0xFFFF00FF, code: 1 },

    Link : { value: 0x0000009F, code: 2 },

    LinkHighlighted : { value: 0x000000FF, code: 3 },

    Word: { value: 0x5555559F, code: 4 },

    WordHighlighted : { value: 0x555555FF, code: 5 }
};
