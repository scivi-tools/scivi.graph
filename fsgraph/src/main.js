// @ts-check

import Viva from './viva-proxy'
import { ColorConverter } from './ColorConverter.js'
export * from './GraphController.js'
export * from './VivaWebGLRenderer.js'
export * from './VivaStateView'

function toggleLabelEvent(event, show, labels) {
    event.showLabel = show;
    labels[event.id].hidden = !show;
}
/*
export function main(container, control, data, colors) {

    var prevMaxWeight = 0;
    var prevMaxEventWeight = 0;
    var graphContainer = createGraph(data, colors);
    var domLabels = generateDOMLabels(graphContainer.itself, container);
    // размещение вершин:
    var layoutPaused = false;
    var layout = Viva.Graph.Layout.forceDirected(graphContainer.itself, {
        springLength : 80,
        springCoeff : 0.0008,
        dragCoeff : 0.02,
        gravity : -1.2,
        // theta : 1
    });

    var graphics = Viva.Graph.View.webglGraphics({
        // явно указываем webgl'ю не чистить backbuffer после свапа
        preserveDrawingBuffer: true,
        // не менее явно указываем виве таки вызывать gl.clear() перед рендером кадра
        // цвет (clearColorValue) оставляем стандартный - белый
        clearColor: true
    });

    // подпилим контролы на панель управления:
    prepareUIControls(control);

    // создаём свои конструкторы вершин и связей и привязываем их к классу графона

    // function that prepares data for node creation
    graphics.node((node) => {
        return Viva.Graph.View.webglSquare(node.data.size, node.data.color);
    });
    
    // func that called after node primitive created
    graphics.placeNode((ui, pos) => {
        // do not forget to restore color
        ui.color = ui.node.data.colorSource.value;

        // update dom trash
        var domLabel = domLabels[ui.node.id];
        if (!domLabel.hidden) {
            var domPos = { x: pos.x, y: pos.y };
            graphics.transformGraphToClientCoordinates(domPos);
            var labelStyle = domLabel.style;
            labelStyle.left = domPos.x + 'px';
            labelStyle.top = domPos.y + 'px';
        }
    });

    // HACK: какого хрена в объекте ui вершин данные хранятся (См. webglGraphics.js, line 253 (addNode())),
    // а для связей - нет? (См. webglGraphics.js, line 232 (addLink()))
    // Пришлось закостылить
    graphics.link((link) => {
        var res = Viva.Graph.View.webglLine(0xb3b3b3ff);
        res.data = link.data;

        return res;
    });
    
    // То, что вызывается перед отрисовкой каждой связи
    graphics.placeLink((ui, fromPos, toPos) => {
        
        ui.color = ui.data.colorSource.value;
    });

    var inputListener = Viva.Graph.webglInputEvents(graphics);

    var renderer = Viva.Graph.View.renderer(graphContainer.itself, {
        layout : layout,
        graphics : graphics,
        container : container,
        prerender: 1000
    });

    // теперь же установим событие клика
    var lastNodeClicked = null;
    inputListener.click((node, unused) => {
        if (node.data.isEvent_WTFHWhoDoesCheckingThisWay) {
            selectEventNode(node);
        }
    });

    window.addEventListener('resize', () => graphics.updateSize());

    renderer.run(0);

    return;

    function selectEventNode(node) {
        if (lastNodeClicked) {
            toggleRelatedWords(graphContainer, lastNodeClicked, domLabels, false);
        }
        if ((lastNodeClicked != node) && (node != null)) {
            toggleRelatedWords(graphContainer, node, domLabels, true);
            lastNodeClicked = node;
        } else {
            lastNodeClicked = null;
        }

        renderer.rerender();
    }

    // Функция у нас будет отвечать за запил контролов
    function prepareUIControls(control) {
    
        // TODO: плохо, что мы тут явно неявно юзаем Jquery-ui
        // @ts-ignore
        $('#wordTresholdSlider').slider({
            min: 1,
            max: graphContainer.maxWordWeight - 1,
            value: 1,
            step: 1,
            slide: (event, ui) => { wordTresholdChanged(ui.value); }
        });

        // @ts-ignore
        $('#eventTresholdSlider').slider({
            min: 0,
            max: graphContainer.maxEventCount,
            value: 0,
            step: 1,
            slide: (event, ui) => { eventTresholdChanged(ui.value); }
        });

        // Кнопочка остановки обновления вершин
        // @ts-ignore
        $('#stopLayoutButton').button({
            // @ts-ignore
            create: (e) => { 
                // @ts-ignore
                $(e.target).click(toggleLayoutPause);
            }
        });

        // Показатель весов отображаемых слов
        updateWorWeightLabel();

        // Выбор цвета?
        buildColorPickers(control);
    }

    function buildColorPickers(control) {
        var allColors = Object.keys(colors);
        // @ts-ignore
        var allColorsValues = Object.values(colors);

        var listColors = document.createElement('ul');

        allColors.forEach((key, index, arr) => {

            // TODO: после перехода на es6 переписать в виде отдельного класса - 
            // своего элемента выбора цвета

            var entryColor = document.createElement('li');

            entryColor.innerText = key + ': ';

            // Создаём ColorPicker - стандартный элемент HTML
            var cpicker = document.createElement('input');
            cpicker.type = 'color';

            // для отладочки пока что посмотрим на результаты конвертации
            var hexRgb = ColorConverter.rgbaToHex(allColorsValues[index].value);
            var alphaComponent = ColorConverter.rgba2a(allColorsValues[index].value);
            // Тупо присваиваем rgb часть цвета элементу управления
            cpicker.value = hexRgb;

            // Запоминаем индекс цвета в специальном хранилище
            // данных, свзяанных с этим элементом
            // HACK: хотя могли и не запоминать, и так доступно!
            cpicker.dataset.id = index.toString();

            // Определяем событие изменения цвета
            // TODO: вообще, насколько быстро (и правильно) обращаться к внешним сущностям
            // из вложенных функций? И тем более обновлять расположенные во внешних
            // переменных значения
            // По крайней мере, саму структуру кода это жутко запутывает
            var onColorChange = () => {
                var here = cpicker;

                allColorsValues[here.dataset.id].value = ColorConverter.hexToRgba(cpicker.value, alphaComponent);

                updateOpacityLabel(alphaComponent);

                renderer.rerender();
            }

            // Обрабатываем таким образом выбор цвета в элементе color...
            cpicker.oninput = onColorChange;

            // И в слайдере
            var alphaSlider = document.createElement('div');
            // @ts-ignore
            $(alphaSlider).slider({
                min: 0,
                max: 255,
                value: alphaComponent,
                step: 1,
                slide: (event, ui) => { 
                    alphaComponent = ui.value;
                    onColorChange();
                }
            });

            // Наконец, немного текстовых меток
            var opacityLabel = document.createElement('span');
            var updateOpacityLabel = (alpha) => {
                // TODO:нормальное название непрозрачности, нормальное числовое отображение
                opacityLabel.innerText = ' Непрозрачность: ' + alpha + ' из 255 ';
            };
            updateOpacityLabel(alphaComponent);

            entryColor.appendChild(cpicker);
            entryColor.appendChild(opacityLabel);
            entryColor.appendChild(alphaSlider);
            listColors.appendChild(entryColor);
        });

        control.appendChild(listColors);
    }
    
    // А эта - обработчик изменения фильтра
    function wordTresholdChanged(unused) {
        data.words.forEach((word) => {
            // Первым делом берём полученное значение и выбрасываем все слова, чей вес меньше указанного
            if ((word.weight >= prevMaxWeight) && (word.weight < unused)) {
                domLabels[word.id].hidden = true;
                graphContainer.itself.removeNode(word.id);
            // А вот теперь можно и в обратную сторону
            } else if ((word.weight < prevMaxWeight) && (word.weight >= unused)) {
                let wordNodeCreated = false;
                // Восстанавливаем все (все!) входящие сюда связи
                data.edges.forEach((edge) => {
                    if (edge.target == word.id) {
                        // Почекаем, есть ли связное событие вообще
                        if (graphContainer.itself.getNode(edge.source)) {
                            // отлично, тогда-то и можно создать вершину-слово!
                            // Если ещё нет, конечно
                            if (!wordNodeCreated) {
                                // TODO: дублирование с процедурой создания графа
                                graphContainer.createNode(word, colors);
                                // TODO: абсолютно лишний мусор, рефактор по этому плачет!
                                domLabels[word.id].hidden = !word.showLabel;
                                wordNodeCreated = true;
                            }
                            // теперь-то можно спокойно восстанавливать связь, не боясь наткнутся
                            // на остутствие связанного события
                            graphContainer.createEdge(edge, colors);
                        }
                    }
                });
            }
        });

        prevMaxWeight = unused;
        updateWorWeightLabel();

        renderer.rerender();
    }

    function eventTresholdChanged(unused) {
        // Сейчас будет очень плохо
        // ... если я чего-то понимаю в оценке сложности,
        // то здесь мы имеем О(число событий * число связных слов)
        // Конечно, это прикидка
        let uselessWords = new Uint16Array(50);
        let uselessWordsCount = 0;
        let eliminateUselessWords = (maxDegree = 0) => {
            let result = false;
            for (let i = 0; i < uselessWordsCount; i++) {
                // TODO: на этом моменте эпизодически возникает ситуация, когда
                // связь ВНЕЗАПНО никуда не исчезла ни из графа, ни из целевой вершины-слова,
                // однако события-то уже нет!
                result = graphContainer.itself.getNode(uselessWords[i]).links.length > maxDegree;
                if (!result) {
                    result = graphContainer.itself.removeNode(uselessWords[i]);
                }
            }
            uselessWordsCount = 0;
        };
        data.nodes.forEach((event) => {
            // Первым делом берём полученное значение и выбрасываем все слова, чей вес меньше указанного
            if ((event.count >= prevMaxEventWeight) && (event.count < unused)) {
                // если вершина была выбрана, то исправим это
                if ((lastNodeClicked != null) && (lastNodeClicked.id == event.id)) {
                    selectEventNode(null);
                    lastNodeClicked = null;
                }
                toggleLabelEvent(event, false, domLabels);
                // Грохаем все связные узлы
                eliminateUselessWords();
                graphContainer.itself.forEachLinkedNode(event.id, (node, link) => {
                    uselessWords[uselessWordsCount] = node.id;
                    uselessWordsCount++;
                    if (uselessWordsCount >= uselessWords.length) {
                        eliminateUselessWords(1);
                    }
                }, true);
                graphContainer.itself.removeNode(event.id);
            // А вот теперь можно и в обратную сторону
            } else if ((event.count < prevMaxEventWeight) && (event.count >= unused)) {
                // TODO: дублирование с процедурой создания графа
                graphContainer.createNode2(event, colors);
                toggleLabelEvent(event, true, domLabels);
                // Восстанавливаем все (все!) выходящие отсюда связи
                data.edges.forEach((edge) => {
                    if (edge.source == event.id) {
                        // TODO: обобщить проверку условий фильтрации слов!
                        // HACK: нечестным образом упростил вычисления индекса слова из
                        // "сплошного" индекса вершины, надо бы учесть в будущем
                        if (data.words[edge.target - data.nodes.length].weight >= prevMaxWeight) {
                            if (!graphContainer.itself.getNode(edge.target))
                                graphContainer.createNode(data.words[edge.target - data.nodes.length], colors);
                            graphContainer.createEdge(edge, colors);
                        }
                    }
                });
            }
        });

        eliminateUselessWords();

        prevMaxEventWeight = unused;
        updateWorWeightLabel();

        renderer.rerender();
    }

    function updateWorWeightLabel() {
        // @ts-ignore
        $("#wordTreshold").text(prevMaxWeight + " из " + graphContainer.maxWordWeight);
        // @ts-ignore
        $("#eventTreshold").text(prevMaxEventWeight + " из " + graphContainer.maxEventCount);
    }

    // Далее попилим обработчик нажатия кнопки приостановления обновляения вершин
    function toggleLayoutPause(ev) {
        // HACK: без понятия для чего это, но в примерах есть
        ev.preventDefault();

        if (layoutPaused) {
            renderer.resume();
        } else {
            renderer.pause();
        }

        layoutPaused = !layoutPaused;
    }
}
*/