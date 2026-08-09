import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import AudioPlayer from './components/AudioPlayer'

import Frontpage from './pages/frontpage'
import Browse from './pages/Browse'
import NewRelease from './pages/NewRelease'
import Library from './pages/Library'
import PodcastDetails from './pages/PodcastDetails'

import SignIn from './pages/SignIn'
import CreateAccount from './pages/CreateAccount'
import CreatorPortal from './pages/CreatorPortal'
import CreatorSignIn from './pages/CreatorSignIn'

import CreatorStudio from './pages/CreatorStudio'
import YourPodcasts from './pages/YourPodcasts'
import CreatePodcast from './pages/CreatePodcast'
import AddEpisode from './pages/AddEpisode'

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Frontpage />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/new-releases" element={<NewRelease />} />
            <Route path="/library" element={<Library />} />
            <Route path="/podcast/:id" element={<PodcastDetails />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/creator/register" element={<CreatorPortal />} />
            <Route path="/creator/signin" element={<CreatorSignIn />} />

            <Route path="/studio" element={<CreatorStudio />} />
            <Route path="/studio/podcasts" element={<YourPodcasts />} />
            <Route path="/studio/new" element={<CreatePodcast />} />
            <Route path="/studio/podcasts/:id/episodes/new" element={<AddEpisode />} />
          </Routes>
          <AudioPlayer />
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  )
}

export default App
