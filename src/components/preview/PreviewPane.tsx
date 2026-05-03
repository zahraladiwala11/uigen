'use client'

import { useFileSystem } from '@/lib/contexts/file-system-context'
import { useEffect, useState } from 'react'
import { PreviewFrame } from './PreviewFrame'

export function PreviewPane() {
  const { fileSystem, refreshTrigger } = useFileSystem()
  const [previewContent, setPreviewContent] = useState<string>('')

  useEffect(() => {
    // Find entry point (App.jsx, App.tsx, index.jsx, or first .jsx/.tsx file)
    const files = fileSystem.getAllFiles()
    const jsxFiles = files.filter(f => 
      f.type === 'file' && (f.name.endsWith('.jsx') || f.name.endsWith('.tsx'))
    )

    let entryFile = jsxFiles.find(f => f.name === 'App.jsx') ||
                   jsxFiles.find(f => f.name === 'App.tsx') ||
                   jsxFiles.find(f => f.name === 'index.jsx') ||
                   jsxFiles[0]

    if (entryFile) {
      // Generate preview HTML
      const html = generatePreviewHTML(files, entryFile)
      setPreviewContent(html)
    } else {
      setPreviewContent('')
    }
  }, [fileSystem, refreshTrigger])

  if (!previewContent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No preview available</p>
          <p className="text-sm">Create a React component (.jsx or .tsx) to see preview</p>
        </div>
      </div>
    )
  }

  return <PreviewFrame content={previewContent} />
}

function generatePreviewHTML(files: any[], entryFile: any): string {
  // Create import map for files
  const fileImports = files
    .filter(f => f.type === 'file')
    .map(f => {
      const blob = new Blob([f.content || ''], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      return `"/${f.path}": "${url}"`
    })
    .join(',\n    ')

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Preview</title>
    <script src="https://esm.sh/@babel/standalone"></script>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18",
        "react-dom": "https://esm.sh/react-dom@18",
        "react-dom/client": "https://esm.sh/react-dom@18/client",
        ${fileImports}
      }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module">
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      
      try {
        // Transform and load the entry file
        const entryCode = \`${entryFile.content || ''}\`;
        const transformedCode = Babel.transform(entryCode, {
          presets: ['react', 'typescript'],
          filename: '${entryFile.name}'
        }).code;
        
        const module = {};
        const exports = {};
        const require = (name) => {
          if (name === 'react') return React;
          throw new Error('Module not found: ' + name);
        };
        
        eval(transformedCode);
        
        const Component = module.exports?.default || exports.default || (() => React.createElement('div', {}, 'No default export found'));
        
        const root = createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));
      } catch (error) {
        document.getElementById('root').innerHTML = \`
          <div style="padding: 20px; color: red; font-family: monospace;">
            <h3>Preview Error:</h3>
            <pre>\${error.message}</pre>
          </div>
        \`;
      }
    </script>
</body>
</html>`
}