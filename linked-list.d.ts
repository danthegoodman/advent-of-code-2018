declare module "linked-list" {
  class ListItem {
    value: string; // extension
    prev: ListItem | null;
    next: ListItem | null;

    detach(): void;
  }

  class LinkedList {
    static from(items: Array<ListItem>): LinkedList;

    static Item: typeof ListItem;

    head: ListItem | null;
  }

  export = LinkedList;
}
