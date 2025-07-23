function CameraPlaylist({ angles, playlist, handleDragStart, handleDrop, currentStep, totalSteps }) {
  return (
    <div className="w-64 p-2 bg-white bg-opacity-70 overflow-y-auto space-y-2">
      <h2 className="font-bold">Camera Angles</h2>
      <div className="space-y-1">
        {Object.keys(angles).map((name) => (
          <div
            key={name}
            draggable
            onDragStart={(e) => handleDragStart(e, name)}
            className="p-1 bg-gray-200 rounded text-center cursor-move capitalize"
          >
            {name}
          </div>
        ))}
      </div>
      <h2 className="font-bold mt-4">Playlist</h2>
      <div className="space-y-1">
        {playlist.map((item, idx) => (
          <div
            key={idx}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, idx)}
            className="h-8 border border-dashed rounded flex items-center justify-center bg-white bg-opacity-60 text-xs capitalize"
          >
            {item ? item.name : `Slot ${idx + 1}`}
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 bg-gray-300 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${totalSteps ? (currentStep / totalSteps) * 100 : 0}%` }}
        ></div>
      </div>
    </div>
  )
}

export default CameraPlaylist
