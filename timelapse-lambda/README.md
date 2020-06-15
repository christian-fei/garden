# timelapse-lambda

create a file `secrets` starting from `secrets.example`

# crontab

copy the contents of `crontab` by editing with `crontab -e`

# streaming service

copy the contents of `stream-rtsp.service` to `/etc/systemd/system/stream-rtsp.service`

then

```sh
sudo systemctl enable stream-rtsp.service
sudo systemctl start stream-rtsp.service
sudo systemctl status stream-rtsp.service
```

this will make an rtsp stream available at `rtsp://:8554/`

# take a frame from the stream

```sh
ffmpeg -y -i rtsp://:8554/ -vframes 1 frame.jpg
```

## notes

current constraint: you'll need to use the region `us-east-1`

## create the GardenTimelapse lambda

```
npm run create-lambda
```

## deploy lambda code

```
npm run deploy-lambda
```

## launch lambda

creates `timelapse.mp4` with given amout of pictures  (see `./launch-aws-lambda`)

```
npm run launch-lambda
```

## delete lambda

```
npm run delete-lambda
```