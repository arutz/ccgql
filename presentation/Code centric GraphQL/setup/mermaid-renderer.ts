// setup/mermaid-renderer.ts
import {defineMermaidRendererSetup} from '@slidev/types'
// example. https://github.com/lukilabs/beautiful-mermaid?tab=readme-ov-file#readme
import {renderMermaid} from 'beautiful-mermaid'

export default defineMermaidRendererSetup(() => {
    return (code, _options) => renderMermaid(code)
})