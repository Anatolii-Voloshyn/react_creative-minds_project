import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import Message from "@/components/message";
import { BsTrash2Fill } from 'react-icons/bs';
import { AiFillEdit } from 'react-icons/ai';
import Link from "next/link";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const route = useRouter();

  //See if user is logged
  const getData = async () => {
    if (loading) {
      return
    };
    
    if (!user) {
      return route.push("/auth/login")
    };

    const collectionRef = collection(db, "posts");
    const q = query(collectionRef, where("user", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      return unsubscribe;
    });
  };

  const deletePost = async(id) => {
    const docRef = doc(db, 'posts', id);
    await deleteDoc(docRef);
  }

  //Get user data
  useEffect(() => {
    getData();
  }, [user, loading]);

  return(
    <div>
      <h1 className="
        flex
        justify-center
        bg-cyan-500
        p-2
        text-sm
        font-medium
        text-white"
      >
        Your post
      </h1>

      <div>
        {posts.map((post) => {
          return(
            <Message key={post.id} {...post}>
              <div className="flex gap-4">
                <button onClick={() => deletePost(post.id)} className="
                  text-pink-600
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2"
                >
                  <BsTrash2Fill className="text-2xl" /> Delete
                </button>

                <Link href={{pathname: "/post", query: post}}>
                  <button className="
                    text-teal-600
                    text-sm
                    flex
                    items-center
                    justify-center
                    gap-2"
                  >
                    <AiFillEdit className="text-2xl" /> Edit
                  </button>
                </Link>
              </div>
            </Message>
          )
        })}
      </div>
      <button onClick={() => auth.signOut()} className="
        font-medium
        text-white
        bg-gray-700
        py-2
        px-4
        my-6
        rounded-lg"
      >
        Sign out
      </button>
    </div>
  );
}