function Controls({ audioOn, toggleAudio, playing, playPlaylist }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
      <button
        onClick={toggleAudio}
        className="px-3 py-1 text-sm bg-white bg-opacity-80 rounded shadow hover:bg-opacity-100"
      >
        {audioOn ? 'Stop Sound' : 'Play Sound'}
      </button>
      <button
        onClick={playPlaylist}
        disabled={playing}
        className="px-3 py-1 text-sm bg-white bg-opacity-80 rounded shadow hover:bg-opacity-100 disabled:opacity-50"
      >
        {playing ? 'Playing...' : 'Play Camera Playlist'}
      </button>
    </div>
  )
}

export default Controls
