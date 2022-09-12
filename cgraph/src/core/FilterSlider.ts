namespace SciViCGraph
{
    export class FilterSlider
    {
        private m_slider: JQuery;

        constructor(divID: string, label: string,
                    minVal: number, maxVal: number, curFromVal: number, curToVal: number,
                    numberOfTicks: number,
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
            this.m_slider = $("<div>").css("margin", "10px 10px 10px 5px");

            if (numberOfTicks <= 0)
                numberOfTicks = 1;

            let step = Math.abs(maxVal - minVal) / numberOfTicks;
            if (step === 0)
                step = 1;

            this.m_slider.slider({
                min: minVal,
                max: maxVal,
                range: true,
                values: [curFromVal, curToVal],
                step: step,
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
                let fv = parseFloat(fromField.val());
                if (isNaN(fv)) {
                    fv = curFromVal;
                    fromField.val(fv);
                }
                if (fv > curToVal) {
                    fv = curFromVal;
                    fromField.val(fv);
                }
                curFromVal = fv;
                this.m_slider.slider("values", 0, curFromVal);
                cb(curFromVal, curToVal);
            });

            toField.change(() => {
                let tv = parseFloat(toField.val());
                if (isNaN(tv)) {
                    tv = curToVal;
                    toField.val(tv);
                }
                if (curFromVal > tv) {
                    tv = curToVal;
                    toField.val(tv);
                }
                curToVal = tv;
                this.m_slider.slider("values", 1, curToVal);
                cb(curFromVal, curToVal);
            });
            
            div.append(label + " ");
            div.append(fromField);
            div.append(" — ");
            div.append(toField);
            div.append(this.m_slider);
        }

        public setValues(v: Range)
        {
            this.m_slider.slider("values", 0, v.min);
            this.m_slider.slider("values", 1, v.max);
        }
    }

    export class FilterDateSlider
    {
        private m_slider: JQuery;

        constructor(divID: string, label: string,
                    minVal: number, maxVal: number, curVal: number,
                    numberOfTicks: number,
                    cb: (fromVal: number, toVal: number) => void)
        {
            const div = $(divID);
            let field = $("<span>").attr({ id: divID + "_field" });

            const options = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            }
            const d = new Date(curVal);
            field.text(d.toLocaleDateString("ru-RU", options));

            const sliderID = divID + "_slider";
            this.m_slider = $("<div>").css("margin", "10px 10px 10px 5px");

            if (numberOfTicks <= 0)
                numberOfTicks = 1;

            let step = Math.abs(maxVal - minVal) / numberOfTicks;
            if (step === 0)
                step = 1;

            this.m_slider.slider({
                min: minVal,
                max: maxVal,
                range: false,
                values: [ curVal ],
                step: step,
                slide: (event, ui) => {
                    const d = new Date(ui.value);
                    field.text(d.toLocaleDateString("ru-RU", options));
                    cb(ui.value - 1, ui.value + 1);
                }
            });

            div.append(label + " ");
            div.append(field);
            div.append(this.m_slider);
        }

        public setValue(v: number)
        {
            this.m_slider.slider("values", 0, v);
        }
    }
}
