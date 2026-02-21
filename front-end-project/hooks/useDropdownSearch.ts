import { useState, useMemo } from "react";

// T is a generic type
// K represents keys within T => name, ID
export const useDropdownSearch = <T, K extends keyof T>(
  items: T[],
  searchKeys: K[]
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [items, searchTerm, searchKeys]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const selectItem = (item: T, displayKey: keyof T) => {
    setSearchTerm(String(item[displayKey]));
    close();
    return item;
  };

  const clear = () => {
    setSearchTerm("");
    close();
  };

  return {
    searchTerm,
    setSearchTerm,
    isOpen,
    open,
    close,
    selectItem,
    clear,
    filteredItems,
  };
};
