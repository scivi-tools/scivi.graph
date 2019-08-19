namespace SciViCGraph
{
    export class FilterSlider
    {
        constructor(divID: string, label: string,
                    minVal: number, maxVal: number, curFromVal: number, curToVal: number,
                    cb: (fromVal: number, toVal: number) => void)
        {
            const fromFieldID = divID + "_from";
            const toFieldID = divID + "_to";
            const div = $(divID);
            
            const fromField = $("<input>").attr({
                type: "number",
                id: fromFieldID,
                min: minVal,
                max: maxVal,
                step: "any",
                value: curFromVal,
            });
            const toField = $("<input>").attr({
                type: "number",
                id: toFieldID,
                min: minVal,
                max: maxVal,
                step: "any",
                value: curToVal
            });

            const sliderID = divID + "_slider";
            const sliderDiv = $("<div>").css("margin", "10px 10px 10px 5px");

            sliderDiv.slider({
                min: minVal,
                max: maxVal,
                range: true,
                values: [curFromVal, curToVal],
                step: Math.abs(maxVal - minVal) / 100.0,
                slide: (event, ui) => {
                    if (ui.value === ui.values[0]) {
                        curFromVal = ui.values[0];
                        fromField.val(curFromVal);
                    } else {
                        curToVal = ui.values[1];
                        toField.val(curToVal);
                    }
                    cb(curFromVal, curToVal);
                }
            });

            fromField.change(() => {
                curFromVal = parseFloat(fromField.val());
                if (isNaN(curFromVal)) {
                    curFromVal = minVal;
                    fromField.val(curFromVal);
                }
                if (curFromVal > curToVal) {
                    curFromVal = minVal;
                    fromField.val(curFromVal);
                }
                sliderDiv.slider("values", 0, curFromVal);
                cb(curFromVal, curToVal);
            });

            toField.change(() => {
                curToVal = parseFloat(toField.val());
                if (isNaN(curToVal)) {
                    curToVal = maxVal;
                    toField.val(curToVal);
                }
                if (curFromVal > curToVal) {
                    curToVal = maxVal;
                    toField.val(curToVal);
                }
                sliderDiv.slider("values", 1, curToVal);
                cb(curFromVal, curToVal);
            });
            
            div.append(label + " ");
            div.append(fromField);
            div.append(" — ");
            div.append(toField);
            div.append(sliderDiv);
        }
    }
}
