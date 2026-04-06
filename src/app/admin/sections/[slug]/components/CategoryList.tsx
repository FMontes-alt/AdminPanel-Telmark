"use client"

import { Reorder } from "framer-motion"
import CategoryItem from "./CategoryItem"

interface CategoryListProps {
    categories: any[]
    onReorder: (newOrder: any[]) => void
    onUpdateCategory: (id: string, name: string) => Promise<void>
    expandedCategoryId: string | null
    onToggleExpand: (id: string) => void
    addingSubId: string | null
    onStartAddingSub: (id: string) => void
    onCancelAddingSub: () => void
    onAddSub: (categoryId: string, name: string) => Promise<void>
    onDeleteCategory: (id: string) => void
    onUpdateSub: (id: string, name: string) => Promise<void>
    onDeleteSubAction: (id: string) => Promise<void>
    onDeleteItem: (id: string) => Promise<void>
    // Item adding state
    addingItemId: string | null
    onStartAddingItem: (subId: string) => void
    onCancelAddingItem: () => void
    onAddItem: (subId: string, data: any) => Promise<void>
    sectionSlug: string
    sectionTemplate: string
    isLocked?: boolean
}

export default function CategoryList({
    categories,
    onReorder,
    onUpdateCategory,
    onUpdateSub,
    expandedCategoryId,
    onToggleExpand,
    addingSubId,
    onStartAddingSub,
    onCancelAddingSub,
    onAddSub,
    onDeleteCategory,
    onDeleteSubAction,
    onDeleteItem,
    addingItemId,
    onStartAddingItem,
    onCancelAddingItem,
    onAddItem,
    sectionSlug,
    sectionTemplate,
    isLocked = false
}: CategoryListProps) {
    return (
        <Reorder.Group 
            axis="y" 
            values={categories} 
            onReorder={isLocked ? () => {} : onReorder}
            className="space-y-4"
        >
            {categories?.map((category) => (
                <CategoryItem 
                    key={category.id}
                    category={category}
                    isLocked={isLocked}
                    isExpanded={expandedCategoryId === category.id}
                    isAddingSub={addingSubId === category.id}
                    onToggleExpand={() => onToggleExpand(category.id)}
                    onUpdateCategory={(name) => onUpdateCategory(category.id, name)}
                    onUpdateSub={onUpdateSub}
                    onDeleteSubAction={onDeleteSubAction}
                    onStartAddingSub={() => onStartAddingSub(category.id)}
                    onCancelAddingSub={onCancelAddingSub}
                    onAddSub={(name) => onAddSub(category.id, name)}
                    onDeleteCategory={() => onDeleteCategory(category.id)}
                    onDeleteItem={onDeleteItem}
                    addingItemId={addingItemId}
                    onStartAddingItem={onStartAddingItem}
                    onCancelAddingItem={onCancelAddingItem}
                    onAddItem={onAddItem}
                    sectionSlug={sectionSlug}
                    sectionTemplate={sectionTemplate}
                />
            ))}
        </Reorder.Group>
    )
}
