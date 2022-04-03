/* 

    CognitoUserPoolMyUserPool:
        Type: AWS::Cognito::UserPool
        Properties:
            UserPoolName: RiseFoundationIntegrationTest-pool

            AdminCreateUserConfig:
                AllowAdminCreateUserOnly: true
                InviteMessageTemplate:
                    EmailSubject: You are being invited to join Grandvalley Strawberries
                UnusedAccountValidityDays: 365

    CognitoUserPoolClient:
        Type: AWS::Cognito::UserPoolClient
        Properties:
            ClientName: RiseFoundationIntegrationTest-pool-client
            UserPoolId:
                Ref: CognitoUserPoolMyUserPool
            ExplicitAuthFlows:
                - ADMIN_NO_SRP_AUTH
            GenerateSecret: false
*/

export function makeCognitoPoolAndClient(name: string) {
    return {
        Resources: {
            CognitoUserPool: {
                Type: 'AWS::Cognito::UserPool',
                Properties: {
                    UserPoolName: `${name}-pool`,
                    AdminCreateUserConfig: {
                        AllowAdminCreateUserOnly: true,
                        UnusedAccountValidityDays: 365
                    }
                }
            },
            CognitoUserPoolClient: {
                Type: 'AWS::Cognito::UserPoolClient',
                Properties: {
                    ClientName: `${name}-pool-client`,
                    UserPoolId: {
                        Ref: 'CognitoUserPool'
                    },
                    ExplicitAuthFlows: ['ADMIN_NO_SRP_AUTH'],
                    GenerateSecret: false
                }
            }
        },
        Outputs: {
            UserPoolId: {
                Value: {
                    Ref: 'CognitoUserPool'
                }
            },
            UserPoolClientId: {
                Value: {
                    Ref: 'CognitoUserPoolClient'
                }
            }
        }
    }
}
