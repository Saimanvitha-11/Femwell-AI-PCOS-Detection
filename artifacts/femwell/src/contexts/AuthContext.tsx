import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

type User = {
  uid: string;
  name: string;
  email: string;
  joinDate: string;
  avatar: string | null;
  providerId: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        // Format creation time or use a fallback
        const creationTime = firebaseUser.metadata.creationTime 
          ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
          : "Recently joined";
          
        const providerId = firebaseUser.providerData.length > 0 ? firebaseUser.providerData[0].providerId : "password";
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          joinDate: creationTime,
          avatar: firebaseUser.photoURL || null,
          providerId,
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
