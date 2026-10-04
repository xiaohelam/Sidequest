/**
 * Furniture sold at Homebase.
 * Add an item here, then draw it in `src/components/home/Room.tsx`
 * (search for the item id). Price is in coins earned from quests.
 */

export type ShopItem = {
  id: string
  name: string
  price: number
  blurb: string
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    price: 25,
    blurb: 'A shelf for the pages you have not opened yet.',
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    price: 50,
    blurb: 'A hearth so the hall is warm when you return.',
  },
  {
    id: 'telescope',
    name: 'Telescope',
    price: 75,
    blurb: 'For looking past the next hill.',
  },
  {
    id: 'plant',
    name: 'Plant',
    price: 15,
    blurb: 'A living thing that asks only for water.',
  },
  {
    id: 'painting',
    name: 'Painting',
    price: 40,
    blurb: 'A landscape of a road you mean to walk.',
  },
]

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id)
}
