import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  Check,
  X,
  ShoppingCart,
  ListTodo,
  Share2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { List } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cardGradient, cn } from "@/lib/utils";

interface ListsProps {
  lists: List[];
  onCreateList: (title: string, type: "pricing" | "general") => void;
  onUpdateList: (
    listId: Id<"lists">,
    title?: string,
    type?: "pricing" | "general",
  ) => void;
  onDeleteList: (listId: Id<"lists">) => void;
  onAddItem: (listId: Id<"lists">, title: string, price?: number) => void;
  onUpdateItem: (
    listId: Id<"lists">,
    itemIndex: number,
    title?: string,
    status?: "checked" | "unchecked",
    price?: number,
  ) => void;
  onRemoveItem: (listId: Id<"lists">, itemIndex: number) => void;
}

interface ListCardProps {
  list: List;
  onEdit: () => void;
  onDelete: () => void;
  onToggleItem: (itemIndex: number) => void;
  onAddItem: (title: string, price?: number) => void;
  onEditItem: (itemIndex: number, title: string, price?: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onExport: () => void;
}

function ListCard({
  list,
  onEdit,
  onDelete,
  onToggleItem,
  onAddItem,
  onEditItem,
  onRemoveItem,
  onExport,
}: ListCardProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  const isPricing = list.type === "pricing";
  const totalPrice = isPricing
    ? list.items.reduce((sum, item) => sum + (item.price || 0), 0)
    : 0;

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    const price =
      isPricing && newItemPrice ? parseFloat(newItemPrice) : undefined;
    onAddItem(newItemTitle, price);
    setNewItemTitle("");
    setNewItemPrice("");
    setShowAddItem(false);
  };

  const startEditingItem = (index: number) => {
    const item = list.items[index];
    setEditingItemIndex(index);
    setEditItemTitle(item.title);
    setEditItemPrice(item.price?.toString() || "");
  };

  const handleEditItem = () => {
    if (editingItemIndex === null || !editItemTitle.trim()) return;
    const price =
      isPricing && editItemPrice ? parseFloat(editItemPrice) : undefined;
    onEditItem(editingItemIndex, editItemTitle, price);
    setEditingItemIndex(null);
    setEditItemTitle("");
    setEditItemPrice("");
  };

  const cancelEditItem = () => {
    setEditingItemIndex(null);
    setEditItemTitle("");
    setEditItemPrice("");
  };

  return (
    <div
      className={cn(
        `group ${cardGradient} border border-border/50 rounded-lg p-5 transition-all duration-200`,
        // "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "animate-in fade-in-0 slide-in-from-bottom-2",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isPricing ? (
            <ShoppingCart className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <ListTodo className="h-5 w-5 text-primary shrink-0" />
          )}
          <h3 className="font-semibold text-lg truncate">{list.title}</h3>
          <Badge
            variant={isPricing ? "default" : "secondary"}
            className="text-xs"
          >
            {list.type}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={onExport}
            title="Export & Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark dark">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit list
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-3">
        {list.items.map((item, index) =>
          editingItemIndex === index ? (
            // Edit mode
            <div
              key={index}
              className="space-y-2 p-3 rounded-md bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/30"
            >
              <Input
                placeholder="Item title"
                value={editItemTitle}
                onChange={(e) => setEditItemTitle(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditItem();
                  if (e.key === "Escape") cancelEditItem();
                }}
                autoFocus
              />
              {isPricing && (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditItem();
                  }}
                />
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditItem} className="flex-1">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditItem}
                  className="flex-1"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // View mode
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-md bg-background/50 border border-border/30 group/item hover:border-primary/30 transition-colors"
            >
              <Checkbox
                checked={item.status === "checked"}
                onCheckedChange={() => onToggleItem(index)}
                className="shrink-0"
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.status === "checked" &&
                    "line-through text-muted-foreground",
                )}
              >
                {item.title}
              </span>
              {isPricing && (
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  E {item.price !== undefined ? item.price.toFixed(2) : "0.00"}
                </div>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => startEditingItem(index)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onRemoveItem(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Add Item Form */}
      {showAddItem ? (
        <div className="space-y-2 p-3 rounded-md bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/30">
          <Input
            placeholder="Item title"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
              if (e.key === "Escape") {
                setShowAddItem(false);
                setNewItemTitle("");
                setNewItemPrice("");
              }
            }}
            autoFocus
          />
          {isPricing && (
            <Input
              type="number"
              step="0.01"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
              }}
            />
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddItem} className="flex-1">
              <Check className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddItem(false);
                setNewItemTitle("");
                setNewItemPrice("");
              }}
              className="flex-1"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowAddItem(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Add Item
        </Button>
      )}

      {/* Pricing Total */}
      {isPricing && list.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total ({list.items.length} items):
          </span>
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            E {totalPrice.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

export function Lists({
  lists,
  onCreateList,
  onUpdateList,
  onDeleteList,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ListsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pricing" | "general">(
    "all",
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [exportingList, setExportingList] = useState<List | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Create/Edit form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"pricing" | "general">("general");

  const handleCreateList = () => {
    if (!formTitle.trim()) return;
    onCreateList(formTitle, formType);
    setFormTitle("");
    setFormType("general");
    setShowCreateDialog(false);
  };

  const handleEditList = () => {
    if (!editingList || !formTitle.trim()) return;
    onUpdateList(editingList._id, formTitle, formType);
    setShowEditDialog(false);
    setEditingList(null);
    setFormTitle("");
    setFormType("general");
  };

  const openEditDialog = (list: List) => {
    setEditingList(list);
    setFormTitle(list.title);
    setFormType(list.type);
    setShowEditDialog(true);
  };

  const openExportDialog = (list: List) => {
    setExportingList(list);
    setSelectedItems(list.items.map((_, index) => index)); // Select all by default
    setShowExportDialog(true);
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const selectAllItems = () => {
    if (exportingList) {
      setSelectedItems(exportingList.items.map((_, index) => index));
    }
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const generateExportText = () => {
    if (!exportingList) return "";

    const selectedItemsData = exportingList.items.filter((_, index) =>
      selectedItems.includes(index),
    );

    let text = `*${exportingList.title}*\n\n`;

    selectedItemsData.forEach((item) => {
      text += `${item.title}`;
      if (exportingList.type === "pricing" && item.price !== undefined) {
        text += ` - E ${item.price.toFixed(2)}`;
      }
      text += "\n";
    });

    if (exportingList.type === "pricing") {
      const total = selectedItemsData.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      text += `\n*Total: E ${total.toFixed(2)}*`;
    }

    return text;
  };

  const handleCopyToClipboard = () => {
    const text = generateExportText();
    navigator.clipboard.writeText(text);
  };

  const handleShareWhatsApp = () => {
    const text = generateExportText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const filteredLists = lists
    .filter((list) => {
      const matchesSearch = list.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || list.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b._creationTime - a._creationTime);

  return (
    <div className="flex-1 overflow-auto bg-dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Lists
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredLists.length}{" "}
                {filteredLists.length === 1 ? "list" : "lists"}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="h-10 md:h-11 shadow-lg shadow-primary/20 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New List</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 md:h-11 bg-card border-border/50"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="h-10"
              >
                All
              </Button>
              <Button
                variant={filterType === "pricing" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("pricing")}
                className="h-10"
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                Pricing
              </Button>
              <Button
                variant={filterType === "general" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("general")}
                className="h-10"
              >
                <ListTodo className="h-3.5 w-3.5 mr-2" />
                General
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredLists.length === 0 ? (
            <div
              className={`${cardGradient} border-2 border-dashed border-border/50 rounded-lg p-12 text-center`}
            >
              <ListTodo className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-base text-muted-foreground mb-2">
                {searchQuery ? "No lists found" : "No lists yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first list to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredLists.map((list) => (
                <ListCard
                  key={list._id}
                  list={list}
                  onEdit={() => openEditDialog(list)}
                  onDelete={() => onDeleteList(list._id)}
                  onToggleItem={(itemIndex) =>
                    onUpdateItem(
                      list._id,
                      itemIndex,
                      undefined,
                      list.items[itemIndex].status === "checked"
                        ? "unchecked"
                        : "checked",
                    )
                  }
                  onAddItem={(title, price) =>
                    onAddItem(list._id, title, price)
                  }
                  onEditItem={(itemIndex, title, price) =>
                    onUpdateItem(list._id, itemIndex, title, undefined, price)
                  }
                  onRemoveItem={(itemIndex) =>
                    onRemoveItem(list._id, itemIndex)
                  }
                  onExport={() => openExportDialog(list)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-dark">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                placeholder="e.g., Grocery Shopping, Project Tasks"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateList();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">List Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as any)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pricing lists allow you to add prices to items and calculate
                totals
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateList}>Create List</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-dark">
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">List Title</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditList();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">List Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as any)}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="default"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button variant={"secondary"} onClick={handleEditList}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export & Share Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-dark max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export & Share List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Selection controls */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <p className="text-sm text-muted-foreground">
                Select items to export ({selectedItems.length} of{" "}
                {exportingList?.items.length || 0} selected)
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllItems}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAllItems}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Items list */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {exportingList?.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-300 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => toggleItemSelection(index)}
                >
                  <Checkbox
                    checked={selectedItems.includes(index)}
                    onCheckedChange={() => toggleItemSelection(index)}
                    className="shrink-0"
                  />
                  <span className="flex-1 text-sm">{item.title}</span>
                  {exportingList.type === "pricing" &&
                    item.price !== undefined && (
                      <div className="text-sm font-medium text-primary">
                        E {item.price.toFixed(2)}
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 rounded-md border border-border/30 max-h-[200px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {generateExportText()}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={handleCopyToClipboard}
                disabled={selectedItems.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                disabled={selectedItems.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
