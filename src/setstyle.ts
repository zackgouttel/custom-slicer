'use strict'
import {VisualSettings} from './settings'

export function setStyle(settings:VisualSettings):void
{
    const style=document.documentElement.style;

    style.setProperty('--default-color',settings.slicerSettings.defaultColor)
    style.setProperty('--selected-color',settings.slicerSettings.selectedColor)
    style.setProperty('--text-align',settings.slicerSettings.textAlign)
    style.setProperty('--font-family',settings.slicerSettings.fontFamily)
    style.setProperty('--font-size',`${settings.slicerSettings.fontSize}pt`)
    style.setProperty('--padding-bottom',`${settings.slicerSettings.paddingBottom}px`)
    style.setProperty('--margin-bottom',`${settings.slicerSettings.marginBottom}px`)
    style.setProperty('--underline-width',`${settings.slicerSettings.underlineWidth}px`)
}