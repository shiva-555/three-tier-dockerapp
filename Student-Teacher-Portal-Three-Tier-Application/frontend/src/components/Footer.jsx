//  src/components/Footer.jsx
import React from "react";
import { Box, Text, Link, HStack, IconButton } from "@chakra-ui/react";

export default function Footer() {
  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/AmanPathak-DevOps/",
      svg: (
        <path
          fill="currentColor"
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 
             3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
             0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61
             -4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757
             -1.09-.745.084-.729.084-.729 1.205.084 1.84 
             1.236 1.84 1.236 1.07 1.835 2.807 1.305 
             3.492.998.108-.776.42-1.305.763-1.605
             -2.665-.3-5.466-1.332-5.466-5.931 
             0-1.31.465-2.381 1.235-3.221-.135-.303
             -.54-1.523.105-3.176 0 0 1.005-.322 
             3.3 1.23a11.51 11.51 0 0 1 3-.405c1.02.005 
             2.045.138 3 .405 2.28-1.552 3.285-1.23 
             3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 
             1.23 1.911 1.23 3.221 0 4.61-2.805 
             5.625-5.475 5.921.435.372.81 1.102.81 
             2.222 0 1.606-.015 2.896-.015 3.286 
             0 .315.21.69.825.57C20.565 22.092 
             24 17.592 24 12.297 24 5.67 18.627.297 
             12 .297z"
        />
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/aman-devops/",
      svg: (
        <path
          fill="currentColor"
          d="M4.98 3.5C4.98 5 3.89 6 2.5 6S0 5 0 
             3.5 1.11 1 2.5 1 4.98 2 4.98 3.5zM0 8h5v16H0V8zm7.5 
             0h4.8v2.3h.1c.67-1.2 2.3-2.5 4.7-2.5C22.4 7.8 
             24 10.3 24 14.2V24h-5V15.3c0-2-.03-4.6-2.8-4.6-2.8 
             0-3.2 2.2-3.2 4.4V24h-5V8z"
        />
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@aman-pathak",
      svg: (
        <path
          fill="currentColor"
          d="M19.6 3H4.4C2 3 0 5 0 7.4v9.2C0 19 
             2 21 4.4 21h15.2C22 21 24 19 24 
             16.6V7.4C24 5 22 3 19.6 3zM9.6 16V8l6.4 4-6.4 4z"
        />
      ),
    },
    {
      name: "Medium",
      href: "https://medium.com/@amanpathakdevops",
      svg: (
        <path
          fill="currentColor"
          d="M0 3v18h24V3H0zm6.7 12.1V8.4l5.3 
             3.9-5.3 2.8zm7.3.1l-5.9-3.4 5.9-4.2v7.6zm2 
             .2V8.2l4 3.1-4 4.1z"
        />
      ),
    },
  ];

  return (
    <Box as="footer" mt="auto" py={6} bg="white" _dark={{ bg: "gray.800" }}>
      <HStack spacing={6} maxW="6xl" mx="auto" px={4} justify="space-between">
        <Text fontSize="sm">
          © {new Date().getFullYear()} Student–Teacher Portal • Built by{" "}
          <Link
            href="https://github.com/AmanPathak-DevOps/"
            isExternal
            color="blue.500"
            fontWeight="semibold"
          >
            Aman Pathak
          </Link>
        </Text>
        <HStack spacing={3}>
          {socialLinks.map(({ name, href, svg }) => (
            <IconButton
              key={name}
              as={Link}
              href={href}
              isExternal
              aria-label={name}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  {svg}
                </svg>
              }
              variant="ghost"
              colorScheme="gray"
            />
          ))}
        </HStack>
      </HStack>
    </Box>
  );
}
