# set base image (host OS)
FROM python:3.8

# set the working directory in the container
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# copy the dependencies file to the working directory
COPY . /usr/src/api

# install dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory
COPY . /usr/src/api

ENTRYPOINT ["python3", "server.py"]
