Project- Student-teacher-portal

Tools- Mysql, Nodejs, React (MRN)

-------------------Dockerfile for the Mysql---------------------

# Use the lightweight Oracle Linux 9 MySQL image (smaller than default Debian)

FROM mysql:9.5.0-oraclelinux9

# Set only essential env vars (no extra layers)

ENV MYSQL_ROOT_PASSWORD=mysql123 \
 MYSQL_DATABASE=school

# Use a named volume instead of copying data (reduces image size)

VOLUME ["/var/lib/mysql"]

# Expose MySQL port

EXPOSE 3306

# Start MySQL

CMD ["mysqld"]

---

Prerequisite --> create docker custom network

-----> docker network create three-tier-network

-----> create the directory with the name of mysql-data as volume


-----> nginx configuration for the build and with communication with backend 

server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend-container:3500/; --->  (backend container name with port)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

---

DATABASE

Step 1 --> By using this dockerfile for the mysql database we have created the docker image

docker build -t mysql-image .

step 2 --> create the container from this mysql-image

docker run --name mysql-container --network=three-tier-network -p 3306:3306 -v mysql-data:/var/lib/mysql -d mysql-image

step 3 --> check the log of the mysql container

docker logs mysql-container

---

Backend

prerequisite

----> set the credential of database in .env directory inside of the Backend directory

.env

host=mysql-container ----> mysql container name as it is need to provide here
user=root
password=mysql123
database=school

---

step 1 --> create the docker image from the docker file

docker build -t backend .

step 2 --> create the docker container from the backend image

docker run -d -p 3500:3500 --name backend-container --network=three-tier-network backend

step 3 --> Check the logs of the backend container

docker logs backend-container

## (you will see the tabel created with the name of "Student" and "Teacher")

Frontend

prerequisite

----> Create the .env file

REACT_APP_API_BASE_URL=backend-container:3500 (backend container name and its port)

---

step 1 --> create the docker image for the frontend

docker build -t frontend .

step 2 --> create the frontend container

docker run -d --name frontend-container --network=three-tier-network -p 80:80 frontend

step 3 --> Check the logs of the frontend container

docker logs frontend-container

-------------------------------------------------------------------------------------------
