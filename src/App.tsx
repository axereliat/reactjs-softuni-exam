import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {PrivateRoute} from './guards/PrivateRoute';

import {Home} from './pages/Home/Home';
import {Login} from './pages/Auth/Login';
import {Register} from './pages/Auth/Register';
import {GamesCatalog} from './pages/Games/GamesCatalog';
import {GameDetails} from './pages/Games/GameDetails';
import {CreateGame} from './pages/Games/CreateGame';
import {EditGame} from './pages/Games/EditGame';
import {SessionsCatalog} from './pages/Sessions/SessionsCatalog';
import {SessionDetails} from './pages/Sessions/SessionDetails';
import {CreateSession} from './pages/Sessions/CreateSession';
import {Profile} from './pages/Profile/Profile';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/" element={<Home/>}/>
                    <Route
                        path="/games/create"
                        element={
                            <PrivateRoute>
                                <CreateGame/>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Home/>
                        </PrivateRoute>
                    }/>
                    <Route path="/games" element={
                        <PrivateRoute>
                            <GamesCatalog/>
                        </PrivateRoute>
                    }/>
                    <Route path="/games/:id" element={
                        <PrivateRoute>
                            <GameDetails/>
                        </PrivateRoute>
                    }/>
                    <Route path="/sessions" element={
                        <PrivateRoute>
                            <SessionsCatalog/>
                        </PrivateRoute>
                    }/>
                    <Route path="/sessions/:id" element={<SessionDetails/>}/>
                    <Route
                        path="/games/:id/edit"
                        element={
                            <PrivateRoute>
                                <EditGame/>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sessions/create"
                        element={
                            <PrivateRoute>
                                <CreateSession/>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile/>
                            </PrivateRoute>
                        }
                    />

                    {/* ROLE-BASED ROUTE EXAMPLES - Uncomment and customize as needed */}

                    {/* Example 1: Admin-only route */}
                    {/*
                    <Route
                        path="/admin/dashboard"
                        element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </RoleBasedRoute>
                        }
                    />
                    */}

                    {/* Example 2: Moderator and Admin route */}
                    {/*
                    <Route
                        path="/moderation"
                        element={
                            <RoleBasedRoute allowedRoles={['admin', 'moderator']}>
                                <ModerationPanel />
                            </RoleBasedRoute>
                        }
                    />
                    */}

                    {/* Example 3: All authenticated users (equivalent to PrivateRoute) */}
                    {/*
                    <Route
                        path="/games/create"
                        element={
                            <RoleBasedRoute allowedRoles={['user', 'moderator', 'admin']}>
                                <CreateGame />
                            </RoleBasedRoute>
                        }
                    />
                    */}

                    {/* Example 4: Custom redirect on access denied */}
                    {/*
                    <Route
                        path="/admin/settings"
                        element={
                            <RoleBasedRoute allowedRoles={['admin']} redirectTo="/dashboard">
                                <AdminSettings />
                            </RoleBasedRoute>
                        }
                    />
                    */}
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
