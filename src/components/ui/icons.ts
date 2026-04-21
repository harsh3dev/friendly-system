import {
  Moon,
  Sun,
  Plus,
  List,
  LayoutGrid,
  Columns,
  Search,
  Clock,
  CheckSquare,
  ClipboardList,
  Pencil,
  Trash2,
  ArrowLeft,
  FolderOpen,
  Layers,
  X,
} from 'lucide-react'

export const icons = {
  Moon,
  Sun,
  Plus,
  List,
  LayoutGrid,
  Columns,
  Search,
  Clock,
  CheckSquare,
  ClipboardList,
  Pencil,
  Trash2,
  ArrowLeft,
  FolderOpen,
  Layers,
  X,
} as const

export type IconName = keyof typeof icons
