"use client";
import React, { useEffect, useState } from "react";
import {
  Flex,
  Spacer,
  Box,
  Button,
  Text,
  Image,
  LinkOverlay,
} from "@chakra-ui/react";
import { VerificationResponse } from "@worldcoin/id";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import NavDrawer from "./NavDrawer";
import HashtankTooltip from "../Tooltip";
import BellImage from "public/static/images/General/Tooltip/Bell.webp";
import usePostUser from "@/new-hooks/users/usePostUsers";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";

const disableScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  window.onscroll = () => window.scrollTo(scrollLeft, scrollTop);
};

const enableScroll = () => {
  window.onscroll = null;
};

const NavHeader = () => {
  const { login, ready, authenticated, user, logout, linkWallet } = usePrivy();
  const address = user?.wallet?.address;
  const { pathname } = useRouter();
  const [isHideLogo, setIsHideLogo] = useState(false);
  const { mutateAsync } = usePostUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isConnected = ready && authenticated && user;

  useEffect(() => {
    if (address) {
      mutateAsync({ address }).catch((error) => console.log("Error:", error));
    }
  }, [address, mutateAsync]);

  useEffect(() => {
    const handleScroll = () => {
      setIsHideLogo(window.scrollY > 0);
    };

    if (isConnected && pathname !== "/aquarium/edit") {
      enableScroll();
      window.addEventListener("scroll", handleScroll);
    } else {
      disableScroll();
    }

    return () => {
      enableScroll();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isConnected, pathname]);

  const verifyProof = async (verificationResponse: VerificationResponse) => {
    const token = (verificationResponse as any).credential;
    // Access the verification credential (token)

    if (!token) {
      console.error("Verification token not found.");
      return;
    }

    try {
      // Send the token to your backend for verification
      const response = await fetch("/api/auth/world-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldIDToken: token }),
      });

      if (response.ok) {
        console.log("Verification successful!");
        // Handle successful verification (e.g., update app state or UI)
      } else {
        console.error("Verification failed.");
      }
    } catch (error) {
      console.error("Error during verification:", error);
    }
  };

  const handleLogin = async () => {
    if (isConnected) {
      // If already connected, you can link wallet or do additional login logic here.
      await linkWallet();
    } else {
      // Trigger the login function if not already connected.
      await login();
    }
  };

  return (
    <Flex
      zIndex={9}
      position="fixed"
      width="100vw"
      minWidth="max-content"
      alignItems="flex-start"
      gap="2"
    >
      <LinkOverlay display={["none", isHideLogo ? "none" : "block"]} href="/">
        <Box p={["5", "5", "10", "20"]}>
          <Image
            maxW="256px"
            width={["40vw", "30vw", "35vw"]}
            src="/static/images/Home/logo.webp"
            alt="Hashtank Logo"
          />
        </Box>
      </LinkOverlay>
      <Spacer />
      <Box p={["5", "5", "20", "20"]}>
        {isConnected ? (
          <NavDrawer />
        ) : (
          <HashtankTooltip
            storageKey="login"
            defaultIsOpen
            Icon={BellImage}
            title="LOG IN TO START PLAYING"
            Instruction={() => (
              <>
                Log in with your wallet or email to start engaging with the
                world of HASHTANK.
              </>
            )}
            Trigger={() => (
              <Flex gap="4">
                {" "}
                {/* Flex container to align the buttons side by side */}
                <Button
                  isDisabled={!ready}
                  onClick={isConnected ? linkWallet : login}
                  maxW="60vw"
                  p={["10px 10px", "30px 50px"]}
                  _hover={{ background: "white", color: "brand.900" }}
                  background="brand.900"
                  color="white"
                >
                  <Text
                    textTransform="uppercase"
                    fontWeight="medium"
                    fontSize={["sm", "lg", "xl"]}
                  >
                    {ready ? "PLAY NOW!" : "loading..."}
                  </Text>
                </Button>
                <IDKitWidget
                  app_id="app_627025f9713c54bc0b0971453e03bb5a"
                  action="hashtank"
                  verification_level={VerificationLevel.Device}
                  handleVerify={verifyProof}
                  onSuccess={handleLogin}
                >
                  {({ open }) => (
                    <Button onClick={open} background="blue.500" color="white">
                      Verify with World ID
                    </Button>
                  )}
                </IDKitWidget>
              </Flex>
            )}
          />
        )}
      </Box>
    </Flex>
  );
};

export default NavHeader;
