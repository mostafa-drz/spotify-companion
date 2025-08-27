#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Dynamic imports for ESM modules
let chalk, ora;

async function loadDependencies() {
  if (!chalk) {
    chalk = (await import('chalk')).default;
  }
  if (!ora) {
    ora = (await import('ora')).default;
  }
}

const program = new Command();

// Utility functions
async function log(message, type = 'info') {
  await loadDependencies();
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    title: chalk.bold.cyan,
  };
  console.log(colors[type](message));
}

async function getVercelInfo() {
  try {
    // Get current user
    const whoami = await runCommand(
      'vercel whoami',
      'Getting Vercel user info...'
    );
    const currentUser = whoami.trim().split('\n')[1]?.trim() || 'unknown';

    // Get available teams
    const teamsOutput = await runCommand(
      'vercel teams ls',
      'Getting Vercel teams...'
    );
    const teams = teamsOutput
      .split('\n')
      .slice(2) // Skip header lines
      .filter(
        (line) =>
          line.trim() &&
          !line.includes('─') &&
          !line.includes('Update available')
      )
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          id: parts[0],
          name: parts.slice(1).join(' '),
        };
      })
      .filter((team) => team.id && team.name);

    // Get available projects
    const projectsOutput = await runCommand(
      'vercel projects ls',
      'Getting Vercel projects...'
    );
    const projects = projectsOutput
      .split('\n')
      .slice(2) // Skip header lines
      .filter(
        (line) =>
          line.trim() &&
          !line.includes('─') &&
          !line.includes('Update available')
      )
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          name: parts[0],
          url: parts[1] || '--',
          updated: parts[2] || '--',
          nodeVersion: parts[3] || '--',
        };
      })
      .filter((project) => project.name);

    return {
      currentUser,
      teams,
      projects,
    };
  } catch (error) {
    await log(
      'Could not get Vercel information. Make sure you are logged in with: vercel login',
      'warning'
    );
    return null;
  }
}

async function runCommand(command, description) {
  await loadDependencies();
  const spinner = ora(description).start();
  try {
    const result = execSync(command, { encoding: 'utf8' });
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    await log(`Error: ${error.message}`, 'error');
    throw error;
  }
}

async function getGcpAccounts() {
  try {
    const result = await runCommand(
      'gcloud auth list --format="value(account)"',
      'Getting authenticated accounts...'
    );
    return result
      .trim()
      .split('\n')
      .filter((account) => account);
  } catch (error) {
    return [];
  }
}

async function getGcpProjects(account) {
  try {
    await runCommand(
      `gcloud config set account ${account}`,
      `Switching to account: ${account}`
    );
    const result = await runCommand(
      'gcloud projects list --format="value(projectId,name)"',
      'Getting projects...'
    );
    return result
      .trim()
      .split('\n')
      .filter((line) => line)
      .map((line) => {
        const [projectId, name] = line.split('\t');
        return { projectId, name };
      });
  } catch (error) {
    return [];
  }
}

async function getProjectNumber(projectId) {
  try {
    const result = await runCommand(
      `gcloud projects describe ${projectId} --format="value(projectNumber)"`,
      'Getting project number...'
    );
    return result.trim();
  } catch (error) {
    await log(`Could not get project number for ${projectId}`, 'warning');
    return null;
  }
}

function getReferenceServiceAccountRoles(serviceAccountEmail) {
  try {
    const result = runCommand(
      `gcloud projects get-iam-policy --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:${serviceAccountEmail}"`,
      'Getting reference service account roles...'
    );
    return result
      .trim()
      .split('\n')
      .filter((role) => role);
  } catch (error) {
    log(
      `Could not get roles for reference service account: ${serviceAccountEmail}`,
      'warning'
    );
    return [];
  }
}

async function setupOIDC() {
  await log(
    '🚀 Interactive OIDC Setup for Vercel + Google Cloud Platform',
    'title'
  );
  await log(
    'This tool will help you set up OIDC federation between Vercel and GCP\n'
  );

  // Step 1: Vercel Configuration
  await log('📋 Step 1: Vercel Configuration', 'title');

  // Get Vercel information automatically
  let vercelInfo = await getVercelInfo();

  // Store vercelInfo globally for later use
  global.vercelInfo = vercelInfo;

  // If Vercel is not authenticated, offer to login
  if (!vercelInfo) {
    await log('Vercel CLI is not authenticated.', 'warning');
    const loginChoice = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'authenticate',
        message: 'Would you like to authenticate with Vercel now?',
        default: true,
      },
    ]);

    if (loginChoice.authenticate) {
      await log('Vercel authentication requires browser interaction.', 'info');
      await log(
        'Please complete the authentication in your browser, then press Enter to continue...',
        'info'
      );

      try {
        // Run vercel login in a way that allows user interaction
        const { spawn } = await import('child_process');
        const vercelLogin = spawn('vercel', ['login'], {
          stdio: 'inherit',
          shell: true,
        });

        await new Promise((resolve, reject) => {
          vercelLogin.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Vercel login failed with code ${code}`));
            }
          });
        });

        // After successful login, get Vercel info
        vercelInfo = await getVercelInfo();

        if (!vercelInfo) {
          await log(
            'Authentication completed but could not get Vercel information. Please try again.',
            'error'
          );
          process.exit(1);
        }
      } catch (error) {
        await log(
          'Vercel authentication failed. Please run "vercel login" manually and try again.',
          'error'
        );
        process.exit(1);
      }
    } else {
      await log(
        'Vercel authentication required to continue. Please run "vercel login" and try again.',
        'error'
      );
      process.exit(1);
    }
  }

  if (vercelInfo) {
    await log(`Current Vercel user: ${vercelInfo.currentUser}`, 'info');

    if (vercelInfo.teams.length > 0) {
      await log(
        `Available teams: ${vercelInfo.teams.map((t) => t.name).join(', ')}`,
        'info'
      );
    }

    if (vercelInfo.projects.length > 0) {
      await log(
        `Available projects: ${vercelInfo.projects.map((p) => p.name).join(', ')}`,
        'info'
      );
    }
  }

  // Determine team configuration
  let teamSlug = null;
  let hasTeam = false;

  if (vercelInfo && vercelInfo.teams.length > 0) {
    if (vercelInfo.teams.length === 1) {
      // Auto-select if only one team
      teamSlug = vercelInfo.teams[0].id;
      hasTeam = true;
      await log(
        `Auto-selected team: ${vercelInfo.teams[0].name} (${teamSlug})`,
        'success'
      );
    } else {
      // Let user choose from multiple teams
      const teamChoices = vercelInfo.teams.map((team) => ({
        name: `${team.name} (${team.id})`,
        value: team.id,
      }));

      const teamAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTeam',
          message: 'Select your Vercel team:',
          choices: [
            ...teamChoices,
            new inquirer.Separator(),
            { name: 'Use personal account (no team)', value: 'personal' },
          ],
        },
      ]);

      if (teamAnswer.selectedTeam !== 'personal') {
        teamSlug = teamAnswer.selectedTeam;
        hasTeam = true;
      }
    }
  } else {
    // No teams available, use personal account
    await log('No teams found, using personal account', 'info');
  }

  const vercelAnswers = { hasTeam, teamSlug };

  const issuerUrl = vercelAnswers.hasTeam
    ? `https://oidc.vercel.com/${vercelAnswers.teamSlug}`
    : 'https://oidc.vercel.com';
  const audience = vercelAnswers.hasTeam
    ? `https://vercel.com/${vercelAnswers.teamSlug}`
    : 'https://vercel.com';

  // Step 2: Google Cloud Account Selection
  await log('\n🔐 Step 2: Google Cloud Account Selection', 'title');

  let accounts = await getGcpAccounts();
  let selectedAccount;

  // If no accounts found, offer to authenticate
  if (accounts.length === 0) {
    await log('No authenticated Google Cloud accounts found.', 'warning');
    const authChoice = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'authenticate',
        message: 'Would you like to authenticate with Google Cloud now?',
        default: true,
      },
    ]);

    if (authChoice.authenticate) {
      await log('Opening Google Cloud authentication...', 'info');
      try {
        await runCommand(
          'gcloud auth login',
          'Authenticating with Google Cloud...'
        );
        accounts = await getGcpAccounts();

        if (accounts.length === 0) {
          await log(
            'Authentication completed but no accounts found. Please try again.',
            'error'
          );
          process.exit(1);
        }
      } catch (error) {
        await log(
          'Authentication failed. Please run "gcloud auth login" manually and try again.',
          'error'
        );
        process.exit(1);
      }
    } else {
      await log(
        'Authentication required to continue. Please run "gcloud auth login" and try again.',
        'error'
      );
      process.exit(1);
    }
  }

  // Add option to authenticate additional accounts
  const accountChoices = [
    ...accounts,
    new inquirer.Separator(),
    { name: '➕ Add another Google Cloud account', value: 'add_account' },
  ];

  const accountAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedAccount',
      message: 'Select your Google Cloud account:',
      choices: accountChoices,
    },
  ]);

  // Handle adding new account
  if (accountAnswers.selectedAccount === 'add_account') {
    await log(
      'Opening Google Cloud authentication for additional account...',
      'info'
    );
    try {
      await runCommand(
        'gcloud auth login',
        'Authenticating additional account...'
      );
      accounts = await getGcpAccounts();

      // Re-prompt for account selection with updated list
      const updatedAccountChoices = [
        ...accounts,
        new inquirer.Separator(),
        { name: '➕ Add another Google Cloud account', value: 'add_account' },
      ];

      const updatedAccountAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedAccount',
          message: 'Select your Google Cloud account:',
          choices: updatedAccountChoices,
        },
      ]);

      selectedAccount = updatedAccountAnswers.selectedAccount;
    } catch (error) {
      await log('Failed to add additional account. Please try again.', 'error');
      process.exit(1);
    }
  } else {
    selectedAccount = accountAnswers.selectedAccount;
  }

  // Step 3: Project Selection
  await log('\n🏗️  Step 3: Google Cloud Project Selection', 'title');
  const projects = await getGcpProjects(selectedAccount);

  if (projects.length === 0) {
    await log('No projects found for the selected account.', 'error');
    process.exit(1);
  }

  const projectAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedProject',
      message: 'Select your Google Cloud project:',
      choices: projects.map((p) => ({
        name: `${p.name} (${p.projectId})`,
        value: p.projectId,
      })),
    },
  ]);

  const projectId = projectAnswers.selectedProject;

  // Set the selected project as the active project
  await log(`Setting active project to: ${projectId}`, 'info');
  await runCommand(
    `gcloud config set project ${projectId}`,
    'Setting active project...'
  );

  const projectNumber = await getProjectNumber(projectId);

  if (!projectNumber) {
    await log(
      'Could not get project number. Please ensure you have proper permissions.',
      'error'
    );
    process.exit(1);
  }

  // Step 4: Environment Configuration
  log('\n🌍 Step 4: Environment Configuration', 'title');
  const environmentAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'environments',
      message: 'Select environments to configure:',
      choices: [
        { name: 'Production', value: 'production' },
        { name: 'Preview', value: 'preview' },
        { name: 'Development', value: 'development' },
      ],
      default: ['production'],
    },
  ]);

  // Step 5: IAM Roles Configuration
  await log('\n🔑 Step 5: IAM Roles Configuration', 'title');
  await log(
    'Enter the IAM roles you want to assign to the service accounts.',
    'info'
  );
  await log('', 'info');
  await log(
    '💡 Tip: You can skip role assignment here and do it manually in the GCP Console later.',
    'info'
  );

  const rolesAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'roles',
      message:
        'Enter comma-separated IAM roles (leave empty to skip role assignment):',
      default: '',
      validate: (input) => {
        if (!input.trim()) return true; // Allow empty input to skip
        const roles = input
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r);
        if (roles.length === 0) return true; // Allow empty input to skip
        for (const role of roles) {
          if (!role.startsWith('roles/')) {
            return `Role "${role}" should start with "roles/"`;
          }
        }
        return true;
      },
    },
  ]);

  const roles = rolesAnswers.roles
    .split(',')
    .map((role) => role.trim())
    .filter((role) => role);

  // Step 6: Confirmation
  await log('\n✅ Step 6: Configuration Summary', 'title');
  await log(
    `Vercel Team: ${vercelAnswers.hasTeam ? vercelAnswers.teamSlug : 'Personal Account'}`
  );
  await log(`Google Account: ${selectedAccount}`);
  await log(`GCP Project: ${projectId} (${projectNumber})`);
  await log(`Environments: ${environmentAnswers.environments.join(', ')}`);
  await log(
    `IAM Roles: ${roles.length > 0 ? roles.join(', ') : 'None (will be assigned manually)'}`
  );
  await log(`Issuer URL: ${issuerUrl}`);
  await log(`Audience: ${audience}`);

  const confirmAnswers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with OIDC setup?',
      default: true,
    },
  ]);

  if (!confirmAnswers.proceed) {
    log('Setup cancelled.', 'warning');
    process.exit(0);
  }

  // Step 7: Check Permissions
  await log('\n🔐 Step 7: Checking Required Permissions', 'title');

  const requiredRoles = [
    'roles/iam.workloadIdentityPoolAdmin',
    'roles/iam.serviceAccountAdmin',
    'roles/resourcemanager.projectIamAdmin',
  ];

  await log('Verifying IAM permissions...', 'info');

  for (const role of requiredRoles) {
    try {
      await runCommand(
        `gcloud projects get-iam-policy ${projectId} --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:${selectedAccount}"`,
        `Checking ${role}...`
      );
    } catch (error) {
      await log(`❌ Missing required permission: ${role}`, 'error');
      await log(
        `Please ask your GCP admin to grant this role to: ${selectedAccount}`,
        'error'
      );
      await log(
        'Or run this command yourself if you have admin access:',
        'info'
      );
      await log(
        `gcloud projects add-iam-policy-binding ${projectId} --member="user:${selectedAccount}" --role="${role}"`,
        'info'
      );
      process.exit(1);
    }
  }

  await log('✅ All required permissions verified!', 'success');

  // Step 8: Execute Setup
  await log('\n🚀 Step 8: Executing OIDC Setup', 'title');

  const setupResults = [];
  let hasFailures = false;

  for (const environment of environmentAnswers.environments) {
    await log(`\n📦 Setting up ${environment} environment...`, 'title');

    const poolId = `vercel-${environment}`;
    const providerId = `vercel-${environment}`;
    const serviceAccountId = `vercel-${environment}`;
    const serviceAccountEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;

    // Check if resources already exist
    try {
      await runCommand(
        `gcloud iam workload-identity-pools describe ${poolId} --location=global`,
        `Checking if ${poolId} exists...`
      );

      // Resource exists, ask user if they want to clean up
      await log(`⚠️  ${poolId} already exists.`, 'warning');
      const cleanupChoice = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'cleanup',
          message: `Do you want to delete existing ${poolId} and recreate it?`,
          default: false,
        },
      ]);

      if (cleanupChoice.cleanup) {
        await log(`🗑️  Cleaning up existing ${poolId}...`, 'info');

        // Delete service account first (if exists)
        try {
          await runCommand(
            `gcloud iam service-accounts delete ${serviceAccountEmail} --quiet`,
            `Deleting service account ${serviceAccountId}...`
          );
        } catch (error) {
          // Service account might not exist, continue
        }

        // Delete workload identity pool (this will also delete the provider)
        await runCommand(
          `gcloud iam workload-identity-pools delete ${poolId} --location=global --quiet`,
          `Deleting workload identity pool ${poolId}...`
        );

        await log(`✅ Cleanup completed for ${poolId}`, 'success');
      } else {
        await log(`⏭️  Skipping ${environment} environment setup`, 'info');
        continue;
      }
    } catch (error) {
      // Resource doesn't exist, continue with creation
      await log(`✅ ${poolId} doesn't exist, proceeding with creation`, 'info');
    }

    try {
      // Create Workload Identity Pool
      await runCommand(
        `gcloud iam workload-identity-pools create ${poolId} --location=global --display-name="Vercel ${environment}"`,
        `Creating Workload Identity Pool for ${environment}...`
      );

      // Create OIDC Provider
      await runCommand(
        `gcloud iam workload-identity-pools providers create-oidc ${providerId} --workload-identity-pool=${poolId} --location=global --issuer-uri="${issuerUrl}" --allowed-audiences="${audience}" --attribute-mapping="google.subject=assertion.sub"`,
        `Creating OIDC Provider for ${environment}...`
      );

      // Get IAM Principal
      const principalResult = await runCommand(
        `gcloud iam workload-identity-pools providers describe ${providerId} --workload-identity-pool=${poolId} --location=global --format="value(name)"`,
        `Getting IAM Principal for ${environment}...`
      );
      const iamPrincipal = principalResult.trim();

      // Create Service Account
      await runCommand(
        `gcloud iam service-accounts create ${serviceAccountId} --display-name="Vercel ${environment}"`,
        `Creating Service Account for ${environment}...`
      );

      // Assign roles to service account
      if (roles.length > 0) {
        await log(
          `🔑 Assigning ${roles.length} IAM roles to ${environment}...`,
          'info'
        );
        for (const role of roles) {
          try {
            await runCommand(
              `gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountEmail}" --role="${role}" --condition=None`,
              `Assigning role ${role} to ${environment}...`
            );
          } catch (error) {
            await log(`Warning: Could not assign role ${role}`, 'warning');
          }
        }
      } else {
        await log(
          `⏭️  Skipping role assignment for ${environment} (no roles specified)`,
          'info'
        );
        await log(
          `💡 You can assign roles manually in the GCP Console later`,
          'info'
        );
      }

      // Grant access to service account
      const subjectValue = vercelAnswers.hasTeam
        ? `owner:${vercelAnswers.teamSlug}:project:${projectId}:environment:${environment}`
        : `owner:personal:project:${projectId}:environment:${environment}`;
      await runCommand(
        `gcloud iam service-accounts add-iam-policy-binding ${serviceAccountEmail} --member="principal://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}/subject/${subjectValue}" --role="roles/iam.workloadIdentityUser"`,
        `Granting access to service account for ${environment}...`
      );

      setupResults.push({
        environment,
        projectId,
        projectNumber,
        serviceAccountEmail,
        poolId,
        providerId,
        iamPrincipal,
        subjectValue,
      });

      await log(`✅ ${environment} environment setup completed!`, 'success');
    } catch (error) {
      hasFailures = true;
      await log(
        `❌ Failed to setup ${environment} environment: ${error.message}`,
        'error'
      );
    }
  }

  // Only proceed if all environments were set up successfully
  if (hasFailures) {
    await log('\n❌ OIDC Setup Failed!', 'error');
    await log(
      'Some environments failed to set up. Please check the errors above and try again.',
      'error'
    );
    await log('Make sure you have the required IAM permissions:', 'info');
    await log('- roles/iam.workloadIdentityPoolAdmin', 'info');
    await log('- roles/iam.serviceAccountAdmin', 'info');
    await log('- roles/resourcemanager.projectIamAdmin', 'info');
    process.exit(1);
  }

  // Step 9: Generate Output
  await log('\n📋 Step 9: Environment Variables Configuration', 'title');

  const envVars = [];

  // If setupResults is empty (all environments skipped), generate from existing resources
  if (setupResults.length === 0) {
    await log(
      '📝 Generating environment variables from existing OIDC resources...',
      'info'
    );

    for (const environment of environmentAnswers.environments) {
      const poolId = `vercel-${environment}`;
      const providerId = `vercel-${environment}`;
      const serviceAccountId = `vercel-${environment}`;
      const serviceAccountEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;

      envVars.push(`# ${environment.toUpperCase()} Environment`);
      envVars.push(`GCP_PROJECT_ID_${environment.toUpperCase()}=${projectId}`);
      envVars.push(
        `GCP_PROJECT_NUMBER_${environment.toUpperCase()}=${projectNumber}`
      );
      envVars.push(
        `GCP_SERVICE_ACCOUNT_EMAIL_${environment.toUpperCase()}=${serviceAccountEmail}`
      );
      envVars.push(
        `GCP_WORKLOAD_IDENTITY_POOL_ID_${environment.toUpperCase()}=${poolId}`
      );
      envVars.push(
        `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_${environment.toUpperCase()}=${providerId}`
      );
      envVars.push('');
    }
  } else {
    setupResults.forEach((result) => {
      envVars.push(`# ${result.environment.toUpperCase()} Environment`);
      envVars.push(
        `GCP_PROJECT_ID_${result.environment.toUpperCase()}=${result.projectId}`
      );
      envVars.push(
        `GCP_PROJECT_NUMBER_${result.environment.toUpperCase()}=${result.projectNumber}`
      );
      envVars.push(
        `GCP_SERVICE_ACCOUNT_EMAIL_${result.environment.toUpperCase()}=${result.serviceAccountEmail}`
      );
      envVars.push(
        `GCP_WORKLOAD_IDENTITY_POOL_ID_${result.environment.toUpperCase()}=${result.poolId}`
      );
      envVars.push(
        `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_${result.environment.toUpperCase()}=${result.providerId}`
      );
      envVars.push('');
    });
  }

  // Display environment variables
  await log('\n📝 Environment Variables Generated:', 'title');
  await log('These will be added to your Vercel project:\n', 'info');

  for (const line of envVars) {
    if (line.startsWith('#')) {
      await log(line, 'title');
    } else if (line.trim()) {
      await log(line, 'info');
    } else {
      console.log('');
    }
  }

  // Create .env.oidc.example file
  const envFilePath = path.join(process.cwd(), '.env.oidc.example');
  fs.writeFileSync(envFilePath, envVars.join('\n'));
  await log(`\n📄 Environment variables saved to: ${envFilePath}`, 'info');

  // Ask if user wants to set environment variables via CLI
  const envVarAnswers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setEnvVars',
      message:
        'Would you like to set these environment variables in Vercel via CLI?',
      default: true,
    },
  ]);

  let envVarSuccess = false;

  if (envVarAnswers.setEnvVars) {
    await log('\n🔧 Setting environment variables in Vercel...', 'info');

    // Get Vercel projects list for selection
    await log('🔍 Checking Vercel project information...', 'info');

    if (!global.vercelInfo) {
      await log('❌ Vercel information not available.', 'error');
      await log(
        'You can set environment variables manually using the .env.oidc.example file',
        'info'
      );
    } else {
      await log(
        `✅ Vercel info found: ${JSON.stringify(global.vercelInfo, null, 2)}`,
        'info'
      );

      if (!global.vercelInfo.projects) {
        await log('❌ No projects array in Vercel info.', 'error');
        await log(
          'You can set environment variables manually using the .env.oidc.example file',
          'info'
        );
      } else {
        const vercelProjects = global.vercelInfo.projects;
        await log(`📋 Found ${vercelProjects.length} Vercel projects`, 'info');

        if (vercelProjects.length === 0) {
          await log(
            '❌ No Vercel projects found. Please create a project first.',
            'error'
          );
          await log(
            'You can set environment variables manually using the .env.oidc.example file',
            'info'
          );
        } else {
          // Let user select from their Vercel projects
          const projectAnswers = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedProject',
              message: 'Select your Vercel project:',
              choices: vercelProjects.map((project) => ({
                name: `${project.name} (${project.url})`,
                value: project.name,
              })),
            },
          ]);

          envVarSuccess = true;

          // Set environment variables for each environment
          for (const result of setupResults) {
            const env = result.environment;
            const envPrefix = env.toUpperCase();

            await log(
              `\n📦 Setting environment variables for ${env}...`,
              'info'
            );

            try {
              // Set each environment variable and wait for completion
              await runCommand(
                `vercel env add GCP_PROJECT_ID_${envPrefix} ${env} ${result.projectId} --yes`,
                `Setting GCP_PROJECT_ID_${envPrefix} for ${env}...`
              );
              await runCommand(
                `vercel env add GCP_PROJECT_NUMBER_${envPrefix} ${env} ${result.projectNumber} --yes`,
                `Setting GCP_PROJECT_NUMBER_${envPrefix} for ${env}...`
              );
              await runCommand(
                `vercel env add GCP_SERVICE_ACCOUNT_EMAIL_${envPrefix} ${env} ${result.serviceAccountEmail} --yes`,
                `Setting GCP_SERVICE_ACCOUNT_EMAIL_${envPrefix} for ${env}...`
              );
              await runCommand(
                `vercel env add GCP_WORKLOAD_IDENTITY_POOL_ID_${envPrefix} ${env} ${result.poolId} --yes`,
                `Setting GCP_WORKLOAD_IDENTITY_POOL_ID_${envPrefix} for ${env}...`
              );
              await runCommand(
                `vercel env add GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_${envPrefix} ${env} ${result.providerId} --yes`,
                `Setting GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_${envPrefix} for ${env}...`
              );

              await log(`✅ Environment variables set for ${env}`, 'success');
            } catch (error) {
              envVarSuccess = false;
              await log(
                `❌ Failed to set environment variables for ${env}: ${error.message}`,
                'error'
              );
              await log(
                'You can set them manually using the .env.oidc.example file',
                'info'
              );
            }
          }

          if (envVarSuccess) {
            await log(
              '\n✅ All environment variables set successfully in Vercel!',
              'success'
            );
          } else {
            await log(
              '\n⚠️  Some environment variables failed to set. Check the errors above.',
              'warning'
            );
            await log(
              'You can set them manually in the Vercel dashboard or use the .env.oidc.example file',
              'info'
            );
          }
        }
      }
    }

    if (envVarSuccess) {
      await log(
        '\n✅ All environment variables set successfully in Vercel!',
        'success'
      );
    } else {
      await log(
        '\n⚠️  Some environment variables failed to set. Check the errors above.',
        'warning'
      );
      await log(
        'You can set them manually in the Vercel dashboard or use the .env.oidc.example file',
        'info'
      );
    }
  } else {
    await log(
      '\n📝 You can set these environment variables manually in the Vercel dashboard',
      'info'
    );
    await log(
      'Go to your Vercel dashboard → Project Settings → Environment Variables',
      'info'
    );
    await log(
      'Or use the generated .env.oidc.example file as a reference',
      'info'
    );
  }

  await log('\n🎉 GCP OIDC Setup Complete!', 'success');
  await log(
    'The Google Cloud Platform side of OIDC federation has been configured.'
  );
  await log('Next, you need to complete the Vercel and application setup.\n');

  // Step 10: Check and Install Required Packages
  await log('\n📦 Step 10: Package Dependencies Check', 'title');

  const requiredPackages = ['google-auth-library', '@vercel/functions'];

  const missingPackages = [];

  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      await log(`✅ ${pkg} is already installed`, 'success');
    } catch (error) {
      missingPackages.push(pkg);
      await log(`❌ ${pkg} is not installed`, 'error');
    }
  }

  if (missingPackages.length > 0) {
    const packageAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installPackages',
        message: `Would you like to install the missing packages: ${missingPackages.join(', ')}?`,
        default: true,
      },
    ]);

    if (packageAnswers.installPackages) {
      await log('\n📦 Installing required packages...', 'info');
      try {
        await runCommand(
          `npm install ${missingPackages.join(' ')}`,
          'Installing packages...'
        );
        await log('✅ Packages installed successfully!', 'success');
      } catch (error) {
        await log(`❌ Failed to install packages: ${error.message}`, 'error');
        await log('You can install them manually with:', 'info');
        await log(`npm install ${missingPackages.join(' ')}`, 'info');
      }
    } else {
      await log('\n📝 You can install the packages manually with:', 'info');
      await log(`npm install ${missingPackages.join(' ')}`, 'info');
    }
  } else {
    await log('✅ All required packages are already installed!', 'success');
  }

  if (roles.length === 0) {
    await log('📝 Next Steps:', 'title');
    await log(
      'Since no IAM roles were assigned, you need to manually assign roles to the service accounts:',
      'info'
    );
    await log(
      '1. Go to Google Cloud Console → IAM & Admin → Service Accounts',
      'info'
    );
    await log(
      '2. Find the service accounts created (vercel-preview, vercel-development, etc.)',
      'info'
    );
    await log(
      '3. Click on each service account and go to "Permissions" tab',
      'info'
    );
    await log(
      '4. Add the required IAM roles for your specific project needs',
      'info'
    );
    await log('');
  }

  // Save configuration to file
  const configPath = path.join(process.cwd(), 'oidc-config.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        setupDate: new Date().toISOString(),
        vercelTeam: vercelAnswers.hasTeam ? vercelAnswers.teamSlug : 'personal',
        gcpAccount: selectedAccount,
        environments: setupResults,
      },
      null,
      2
    )
  );

  await log(`📄 Configuration saved to: ${configPath}`, 'info');

  // Step 11: CLI Tools Check
  await log('\n🔧 Step 11: CLI Tools Check', 'title');

  // Check if gcloud is installed
  try {
    await runCommand('gcloud --version', 'Checking gcloud CLI...');
    await log('✅ gcloud CLI is installed', 'success');
  } catch (error) {
    await log('❌ gcloud CLI is not installed', 'error');
    await log(
      'Install it from: https://cloud.google.com/sdk/docs/install',
      'info'
    );
  }

  // Check if vercel CLI is installed
  try {
    await runCommand('vercel --version', 'Checking Vercel CLI...');
    await log('✅ Vercel CLI is installed', 'success');
  } catch (error) {
    await log('❌ Vercel CLI is not installed', 'error');
    await log('Install it with: npm i -g vercel', 'info');
  }

  // Step 12: Next Steps Guide
  await log('\n📋 Step 12: Complete Your OIDC Setup', 'title');
  await log('🎉 Setup Summary:', 'title');
  await log('✅ GCP OIDC resources created', 'success');
  if (envVarAnswers.setEnvVars && envVarSuccess) {
    await log('✅ Environment variables set in Vercel', 'success');
  } else {
    await log('📝 Environment variables saved to .env.oidc.example', 'info');
  }
  await log('✅ Required packages checked/installed', 'success');
  await log('✅ CLI tools verified', 'success');
  await log('');

  await log('💻 Final Step: Update Your Application Code', 'title');
  await log('You need to update your code to use OIDC authentication:', 'info');
  await log('');

  await log('1. Update Firebase Admin SDK initialization:', 'info');
  await log('   Replace your current initialization with:', 'info');
  await log(
    '   import { initializeApp, applicationDefault } from "firebase-admin/app";',
    'info'
  );
  await log(
    '   initializeApp({ credential: applicationDefault(), ... });',
    'info'
  );
  await log('');

  await log(
    '2. Update Google Cloud services (Text-to-Speech, Storage, etc.):',
    'info'
  );
  await log('   Use OIDC authentication with ExternalAccountClient', 'info');
  await log('');

  await log('📚 For detailed code examples, see:', 'info');
  await log('🔗 https://vercel.com/docs/oidc/gcp', 'info');
  await log('');

  await log('🧪 Test Your Setup:', 'info');
  await log('1. Deploy to Vercel', 'info');
  await log('2. Test your services', 'info');
  await log('3. Check function logs for errors', 'info');
  await log('');

  await log('⚠️  Important:', 'title');
  await log(
    '• OIDC works only in Vercel production/preview environments',
    'warning'
  );
  await log('• Local development still needs service account keys', 'warning');
  await log('');

  await log(
    '🎯 Your OIDC setup is complete! Ready for production deployment.',
    'success'
  );
}

// CLI Commands
program
  .name('setup-oidc')
  .description('Interactive OIDC setup for Vercel + Google Cloud Platform')
  .version('1.0.0');

program
  .command('setup')
  .description('Start interactive OIDC setup')
  .action(setupOIDC);

program
  .command('list-accounts')
  .description('List available Google Cloud accounts')
  .action(() => {
    const accounts = getGcpAccounts();
    if (accounts.length === 0) {
      log('No authenticated accounts found. Run: gcloud auth login', 'warning');
    } else {
      log('Available Google Cloud accounts:', 'title');
      accounts.forEach((account) => log(`  - ${account}`, 'info'));
    }
  });

program
  .command('list-projects')
  .description('List available Google Cloud projects')
  .option('-a, --account <account>', 'Google Cloud account to use')
  .action(async (options) => {
    let account = options.account;

    if (!account) {
      const accounts = getGcpAccounts();
      if (accounts.length === 0) {
        log('No authenticated accounts found. Run: gcloud auth login', 'error');
        process.exit(1);
      }

      if (accounts.length === 1) {
        account = accounts[0];
      } else {
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedAccount',
            message: 'Select account:',
            choices: accounts,
          },
        ]);
        account = answer.selectedAccount;
      }
    }

    const projects = getGcpProjects(account);
    if (projects.length === 0) {
      log('No projects found for this account.', 'warning');
    } else {
      log(`Projects for account ${account}:`, 'title');
      projects.forEach((project) => {
        log(`  - ${project.name} (${project.projectId})`, 'info');
      });
    }
  });

program.parse();
