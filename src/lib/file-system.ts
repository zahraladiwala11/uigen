export interface VirtualFile {
  id: string
  name: string
  type: 'file' | 'directory'
  content?: string
  parentId?: string
  children?: string[]
  path: string
}

export class VirtualFileSystem {
  private files: Map<string, VirtualFile> = new Map()
  private rootId = 'root'

  constructor() {
    // Create root directory
    this.files.set(this.rootId, {
      id: this.rootId,
      name: '',
      type: 'directory',
      children: [],
      path: '',
    })
  }

  createFile(path: string, content: string = ''): VirtualFile {
    const segments = path.split('/').filter(Boolean)
    const fileName = segments.pop()!
    const parentPath = segments.join('/')
    
    // Ensure parent directories exist
    const parentId = this.ensureDirectory(parentPath)
    
    const fileId = this.generateId()
    const file: VirtualFile = {
      id: fileId,
      name: fileName,
      type: 'file',
      content,
      parentId,
      path,
    }

    this.files.set(fileId, file)
    
    // Add to parent's children
    const parent = this.files.get(parentId)!
    if (!parent.children) parent.children = []
    parent.children.push(fileId)

    return file
  }

  createDirectory(path: string): VirtualFile {
    return this.ensureDirectoryAsFile(path)
  }

  private ensureDirectory(path: string): string {
    if (!path) return this.rootId

    const segments = path.split('/').filter(Boolean)
    let currentPath = ''
    let currentId = this.rootId

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      
      // Look for existing directory
      const existing = Array.from(this.files.values()).find(
        file => file.path === currentPath && file.type === 'directory'
      )

      if (existing) {
        currentId = existing.id
      } else {
        // Create new directory
        const dirId = this.generateId()
        const directory: VirtualFile = {
          id: dirId,
          name: segment,
          type: 'directory',
          children: [],
          parentId: currentId,
          path: currentPath,
        }

        this.files.set(dirId, directory)
        
        // Add to parent's children
        const parent = this.files.get(currentId)!
        if (!parent.children) parent.children = []
        parent.children.push(dirId)

        currentId = dirId
      }
    }

    return currentId
  }

  private ensureDirectoryAsFile(path: string): VirtualFile {
    const id = this.ensureDirectory(path)
    return this.files.get(id)!
  }

  getFile(path: string): VirtualFile | undefined {
    return Array.from(this.files.values()).find(file => file.path === path)
  }

  updateFile(path: string, content: string): VirtualFile | undefined {
    const file = this.getFile(path)
    if (file && file.type === 'file') {
      file.content = content
      return file
    }
    return undefined
  }

  deleteFile(path: string): boolean {
    const file = this.getFile(path)
    if (!file) return false

    // Remove from parent's children
    if (file.parentId) {
      const parent = this.files.get(file.parentId)!
      if (parent.children) {
        parent.children = parent.children.filter(id => id !== file.id)
      }
    }

    // If directory, recursively delete children
    if (file.type === 'directory' && file.children) {
      for (const childId of file.children) {
        const child = this.files.get(childId)
        if (child) {
          this.deleteFile(child.path)
        }
      }
    }

    this.files.delete(file.id)
    return true
  }

  renameFile(oldPath: string, newPath: string): VirtualFile | undefined {
    const file = this.getFile(oldPath)
    if (!file) return undefined

    const newSegments = newPath.split('/').filter(Boolean)
    const newName = newSegments.pop()!
    const newParentPath = newSegments.join('/')

    // Update file properties
    file.name = newName
    file.path = newPath

    // If moving to different parent
    if (newParentPath !== oldPath.split('/').slice(0, -1).join('/')) {
      // Remove from old parent
      if (file.parentId) {
        const oldParent = this.files.get(file.parentId)!
        if (oldParent.children) {
          oldParent.children = oldParent.children.filter(id => id !== file.id)
        }
      }

      // Add to new parent
      const newParentId = this.ensureDirectory(newParentPath)
      file.parentId = newParentId
      const newParent = this.files.get(newParentId)!
      if (!newParent.children) newParent.children = []
      newParent.children.push(file.id)
    }

    return file
  }

  getAllFiles(): VirtualFile[] {
    return Array.from(this.files.values()).filter(file => file.id !== this.rootId)
  }

  getDirectoryTree(): VirtualFile {
    return this.files.get(this.rootId)!
  }

  serialize(): any[] {
    return Array.from(this.files.values())
  }

  static deserialize(data: any[]): VirtualFileSystem {
    const fs = new VirtualFileSystem()
    fs.files.clear()
    
    for (const item of data) {
      fs.files.set(item.id, item)
    }
    
    return fs
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}