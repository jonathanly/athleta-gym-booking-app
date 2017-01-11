export default function replaceItemWithID(items, id, newItem) {
    return items.map(item => (
        (item._id === id) ? newItem : item
    ))
}