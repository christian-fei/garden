#!/usr/bin/env node

const AWS = require('aws-sdk')

const region = 'eu-central-1'

const apiVersion = 'latest'
const lambda = new AWS.Lambda({ apiVersion, region })
const invokeParams = { FunctionName: 'GardenTimelapse' }

lambda.invoke(invokeParams, (err, data) => {
  console.log(err, data)
})
