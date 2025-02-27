export const neoBrutalColors = {
    background: "#EF476F",
    card: "#FFD166",
    accent1: "#06D6A0",
    accent2: "#118AB2",
    text: "#000000",
    white: "#FFFFFF",
  }
  
  export const neoBrutalStyles = {
    input:
      "p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white text-black font-bold focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all",
    button:
      "p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]",
    checkbox: "w-6 h-6 border-4 border-black accent-[#FF8A65] focus:outline-none focus:ring-0",
    card: "bg-[#FFD166] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-8",
    table: "border-4 border-black bg-white text-black",
    tableHeader: "border-b-4 border-black bg-[#06D6A0] text-black font-bold",
    tableCell: "border-b-4 border-black p-3",
  }
  
  export const NeoBrutalButton = ({ children, className = "", ...props }) => (
    <button className={`${neoBrutalStyles.button} ${className}`} {...props}>
      {children}
    </button>
  )
  
  export const NeoBrutalInput = ({ className = "", ...props }) => (
    <input className={`${neoBrutalStyles.input} ${className}`} {...props} />
  )
  
  export const NeoBrutalCard = ({ children, className = "", ...props }) => (
    <div className={`${neoBrutalStyles.card} ${className}`} {...props}>
      {children}
    </div>
  )
  
  