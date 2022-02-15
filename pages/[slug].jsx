import PasswordForm from "../components/PasswordForm";
import { toast, ToastContainer } from "react-toastify";
import { navbarState } from "../atoms/navbarAtom";
import MainLogo from "../components/MainLogo";
import { BASE_URL } from "../utils/config";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { useState } from "react";
import axios from "axios";

const RedirectPage = ({ slug }) => {
  const [navbarOpen, setNavbarOpen] = useRecoilState(navbarState);

  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(BASE_URL + "/api/verify", { slug, password })
      .then((response) => {
        router.push(response.data.linkData.link);
      })
      .catch((error) => {
        toast.error("Wrong Password");
      });
  };

  return (
    <div
      className={`${
        navbarOpen ? "scale-90" : "scale-100"
      } animate flex h-screen flex-col items-center justify-center space-y-10 bg-slate-50`}
    >
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        theme="colored"
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div>
        <MainLogo />
        <PasswordForm
          password={password}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default RedirectPage;

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  let responseData;
  let isProtected = false;

  // get axios response, verify slug
  await axios
    .post(BASE_URL + "/api/verify", {
      slug: slug,
      password: "",
    })
    .then((response) => {
      // save response data
      responseData = response.data;
    })
    .catch((error) => {
      // save response data
      responseData = error.response.data;
      // check if link is protected
      isProtected = error.response.data.linkData.protected;
    });

  // if returned link is empty, then 404
  if (responseData.linkData.link.length < 1) {
    return {
      notFound: true,
    };
  }

  // if link is protected, input password
  if (isProtected) {
    return {
      props: {
        slug,
      },
    };
  } else {
    // if link isn't protected, redirect
    return {
      redirect: {
        destination: responseData.linkData.link,
        permanent: false,
      },
    };
  }
}