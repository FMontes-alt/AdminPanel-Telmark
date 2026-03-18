"use client"

import React from "react"
import { ElementSelector } from "./ElementSelector"
import { WidgetType } from "@/lib/types/campaing-builder"

interface BuilderSidebarProps {
    onAddWidget: (type: WidgetType) => void;
}

export function BuilderSidebar({ onAddWidget }: BuilderSidebarProps) {
    return (
        <aside className="w-full lg:w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto custom-scrollbar">
            <ElementSelector onAddElement={onAddWidget} />
        </aside>
    );
}
