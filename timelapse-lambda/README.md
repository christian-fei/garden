# timelapse-lambda

create a file `secrets` starting from `secrets.example`

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