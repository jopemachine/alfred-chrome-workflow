interface BookmarkElement {
  name: string;
  url: string;
  date_added: number;
  guid: string;
  id: number;
  type: string;
  meta_info?: {
    last_visited?: number;
    last_visited_desktop?: number;
  }
}
