"use client"

import { Reorder } from "framer-motion"
import CategoryItem from "./CategoryItem"

interface CategoryListProps {
    categories: any[]
    onReorder: (newOrder: any[]) => void
    expandedCategoryId: string | null
    onToggleExpand: (id: string) => void
    addingSubId: string | null
    onStartAddingSub: (id: string) => void
    onCancelAddingSub: () => void
    onAddSub: (categoryId: string, name: string) => Promise<void>
    onDeleteCategory: (id: string) => void
    onDeleteSub: (id: string) => void
    onDeleteItem: (id: string) => void
    // Item adding state
    addingItemId: string | null
    onStartAddingItem: (subId: string) => void
    onCancelAddingItem: () => void
    onAddItem: (subId: string, data: any) => Promise<void>
}

export default function CategoryList({
    categories,
    onReorder,
    expandedCategoryId,
    onToggleExpand,
    addingSubId,
    onStartAddingSub,
    onCancelAddingSub,
    onAddSub,
    onDeleteCategory,
    onDeleteSub,
    onDeleteItem,
    addingItemId,
    onStartAddingItem,
    onCancelAddingItem,
    onAddItem
}: CategoryListProps) {
    return (
        <Reorder.Group 
            axis="y" 
            values={categories} 
            onReorder={onReorder}
            className="space-y-4"
        >
            {categories.map((category) => (
                <CategoryItem 
                    key={category.id}
                    category={category}
                    isExpanded={expandedCategoryId === category.id}
                    isAddingSub={addingSubId === category.id}
                    onToggleExpand={() => onToggleExpand(category.id)}
                    onStartAddingSub={() => onStartAddingSub(category.id)}
                    onCancelAddingSub={onCancelAddingSub}
                    onAddSub={(name) => onAddSub(category.id, name)}
                    onDeleteCategory={() => onDeleteCategory(category.id)}
                    onDeleteSub={onDeleteSub}
                    onDeleteItem={onDeleteItem}
                    addingItemId={addingItemId}
                    onStartAddingItem={onStartAddingItem}
                    onCancelAddingItem={onCancelAddingItem}
                    onAddItem={onAddItem}
                />
            ))}
        </Reorder.Group>
    )
}
