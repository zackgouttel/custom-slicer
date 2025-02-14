/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject
import IVisualHost=powerbi.extensibility.visual.IVisualHost;
import { IBasicFilter,FilterType } from "powerbi-models";

import {transformData, VData} from './transformdata';
import {setStyle} from './setstyle';

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHost;
    private container: HTMLElement;
    private slicerItems: HTMLElement;
    private settings: VisualSettings;
    private basicFilter:IBasicFilter;
    private data:VData;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        this.host=options.host;
        this.basicFilter=null;
        this.data = null;
        if (document) {
            this.container = document.createElement('div');
            this.container.classList.add('slicer-container');
            this.slicerItems = document.createElement('ul');
            this.container.appendChild(this.slicerItems);
            this.target.appendChild(this.container);
      
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        this.data=transformData(options);
        console.log('Data:',this.data);
        setStyle(this.settings);

         this.basicFilter = {
            $schema: "http://powerbi.com/product/schema#basic",
            target: {
                table:this.data.table,
                column: this?.data.column
            },
            operator: "In",
            values: null,
            filterType: FilterType.Basic
        }

        while (this.slicerItems.firstChild) {
            this.slicerItems.removeChild(this.slicerItems.firstChild);
        }
        this.addItem(this.settings.slicerSettings.allSelectedLabel);

        //slicer items
        for(let value of this.data.values)
        {
            this.addItem(value.toString());
        }

        this.styleSelected(options);
    }

    private addItem(value: string) :void {
        let slicerItem=document.createElement('li');
        let itemContainer=document.createElement('span');
        itemContainer.innerText=value;
        if (value!==this.settings.slicerSettings.allSelectedLabel)
         {
            itemContainer.onclick=()=>{
                this.basicFilter.values=[value];
                this.host.applyJsonFilter(this.basicFilter,'general','filter',powerbi.FilterAction.merge);
         }
        } else
        {
            itemContainer.onclick=()=>{
                this.host.applyJsonFilter(this.basicFilter,'general','filter',powerbi.FilterAction.remove);
            }
         }
        slicerItem.appendChild(itemContainer);
        this.slicerItems.appendChild(slicerItem);
    }

    private styleSelected(opt:VisualUpdateOptions):void{
        const slicerItems=this.slicerItems.children;
        const f=opt.jsonFilters;
        if (f.length===0)
        {
            slicerItems[0].children[0].classList.add('selected');
        }
        else {
            const selected=(<IBasicFilter>f[0]).values[0];
            for(let i=0;i<slicerItems.length;i++)
            {
               const item= <HTMLElement>slicerItems[i].children[0];
               if (item.innerText===selected)
               {
                   item.classList.add('selected');
               }
            }
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}