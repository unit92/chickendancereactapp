function Toasts({ toasts }) {
  return (
    <div className="absolute top-4 right-4 space-y-2 z-20">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-2 py-1 bg-black bg-opacity-80 text-white text-sm rounded"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default Toasts
