export const IconButton: React.FC<{
  icon: 'plus' | 'minus'
  onClick: React.MouseEventHandler
  className?: string
  size?: 'base' | 'sm'
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={
        (props.className?.includes('bg-') ? '' : 'bg-black/40') +
        ' text-white rounded-full shadow-lg backdrop-filter backdrop-blur-sm border-2 border-black/10 flex items-center gap-1 sm:gap-2 ' +
        props.className
      }
    >
      {props.icon === 'plus' && <p className="text-xs font-semibold pl-1.5">Add</p>}
      <svg
        className={props.size === 'sm' ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-12 h-12'}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {props.icon === 'minus' && (
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
        )}
        {props.icon === 'plus' && (
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          ></path>
        )}
      </svg>
    </button>
  )
}
