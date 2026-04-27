![](https://github.com/openmainframeproject/artwork/raw/master/projects/softwarediscoverytool/softwarediscoverytool-color.svg)

# Software Discovery Tool

![License](https://img.shields.io/github/license/openmainframeproject/software-discovery-tool)

Welcome to the Software Discovery Tool! This tool is designed to help you discover open source software for zArchitecture/s390x across various sources and repositories. With the Software Discovery Tool, you can conveniently search for software from any source, any repository, anywhere, all in one place.

## Project Tour

To get started with the Software Discovery Tool, let's take a quick tour of the project and its repositories.

| Repository                                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Software Discovery Tool](https://github.com/openmainframeproject/software-discovery-tool)               | The main repository of the Software Discovery Tool contains the core functionalities and codebase of the tool. It enables you to search and discover open source software for `zArchitecture/s390x`. You'll find the source code, documentation, and guidelines for contributing to the project in this repository.                                                                                                                                 |
| [Software Discovery Tool Data](https://github.com/openmainframeproject/software-discovery-tool-data)     | The Software Discovery Tool Data repository holds the necessary data for the software available in the tool. It contains information such as the names and versions of the software that you can discover using the Software Discovery Tool. This data is regularly updated to provide you with the most comprehensive and up-to-date software inventory.                                                                                           |
| [Software Discovery Tool Deploy](https://github.com/openmainframeproject/software-discovery-tool-deploy) | The Software Discovery Tool Deploy repository serves as the deployed version of the main Software Discovery Tool repository. It utilizes the main repository as a submodule and integrates the data repository as a sub-submodule. This deployment repository enables you to quickly set up and run the Software Discovery Tool in your environment. Read more about it [here](https://gist.github.com/rachejazz/de39c09612788635d5d0f491dcf8571a). |

## Local Development Setup

To run the Software Discovery Tool locally for development:

### 1. Prerequisites
- Node.js (v18+) and npm
- Python 3 with `pymysql` and `requests`
- MariaDB or MySQL server

### 2. Database Setup
1. Create a database (e.g., `sdtDB`) and a user with `SELECT` permissions.
2. Clone the data submodules:
   ```bash
   git submodule update --init --recursive
   ```
3. (Optional) Fetch additional distro data:
   ```bash
   python3 bin/package_build.py debian
   ```
4. Initialize the database schema and populate data:
   ```bash
   python3 bin/database_build.py
   ```
   *Note: Use a privileged database user (like root) when prompted to create tables.*

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.
4. Start the backend:
   ```bash
   npm start
   ```

### 4. Frontend Setup
1. Navigate to the `react-frontend` directory:
   ```bash
   cd react-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Ensure `REACT_APP_API_URL` points to your backend (default `http://localhost:5000`).
4. Start the frontend:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

All contributions must align with the [Open Mainframe Project contribution guidelines](https://tac.openmainframeproject.org/process/contribution_guidelines.html), including having a DCO signoff on all commits.

For full contribution requirements, please review our [guidelines](docs/Contribute.md).

## Discussion

If you have any questions, suggestions, or need assistance, feel free to reach out to us.

- Mailing list: [https://lists.openmainframeproject.org/g/software-discovery-tool-discussion](https://lists.openmainframeproject.org/g/software-discovery-tool-discussion)
- [Slack](https://slack.openmainframeproject.org/): `#software-discovery-tool` channel
