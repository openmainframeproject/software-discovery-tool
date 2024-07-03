export const questions = [
  {
    id: 1,
    que: 'What is Software Discovery Tool?',
    ans: (
      <p>
        Software Discovery Tool, helps you to search for available packages across OS distributions supported by the s390x architecture in a
        single user interface.
      </p>
    )
  },
  {
    id: 2,
    que: 'Which operating systems does Software Discovery Tool have data files for?',
    ans: (
      <div>
        <p>
          Software Discovery Tool helps you to search for available packages across OS distributions supported by the s390x architecture in
          a single user interface. Currently, Software Discovery Tool contains data for the following operating systems:
        </p>
        <ul>
          <li>
            <span className='bullet-icon'>•</span> IBM z/OS
          </li>
          <li>
            <span className='bullet-icon'>•</span> Debian 10 (Buster)
          </li>
          <li>
            <span className='bullet-icon'>•</span> Debian 11 (Bullseye)
          </li>
          <li>
            <span className='bullet-icon'>•</span> Debian 12 (Bookworm)
          </li>
          <li>
            <span className='bullet-icon'>•</span> ClefOS 7
          </li>
          <li>
            <span className='bullet-icon'>•</span> openSUSE Tumbleweed
          </li>
          <li>
            <span className='bullet-icon'>•</span> openSUSE Leap 15.3
          </li>
          <li>
            <span className='bullet-icon'>•</span> openSUSE Leap 15.4
          </li>
          <li>
            <span className='bullet-icon'>•</span> openSUSE Leap 15.5
          </li>
          <li>
            <span className='bullet-icon'>•</span> Fedora 38
          </li>
          <li>
            <span className='bullet-icon'>•</span> Fedora 39
          </li>
          <li>
            <span className='bullet-icon'>•</span> Fedora 40
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for RHEL 8
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for RHEL 9
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for SLES 12
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for SLES 15
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for Ubuntu 20.04
          </li>
          <li>
            <span className='bullet-icon'>•</span> IBM Validated List for Ubuntu 22.04
          </li>
          <li>
            <span className='bullet-icon'>•</span> AlmaLinux 9
          </li>
          <li>
            <span className='bullet-icon'>•</span> Rocky Linux 9
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    que: 'Where can I find more details about packages available for various distros?',
    ans: (
      <div>
        <div>
          <h1 style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Linux</h1>
          <ul>
            <li>
              <span className='bullet-icon'>•</span> IBM Z and LinuxONE Container Registry: A collection of Linux-based software
              containerized for the IBM Z architecture, and maintained by IBM. Details:{' '}
              <a href='https://ibm.github.io/ibm-z-oss-hub/main/main.html' target='_blank' rel='noreferrer'>
                https://ibm.github.io/ibm-z-oss-hub/main/main.html
              </a>
            </li>
            <li>
              <span className='bullet-icon'>•</span> IBM Z Validated: A list of Linux-based software that is regularly reviewed by the open
              source ecosystem team at IBM as building for s390x, with build instructions included, where applicable. They span support for
              various versions of RHEL, SUSE, and Ubuntu. Details:{' '}
              <a href='https://www.ibm.com/community/z/open-source-software' target='_blank' rel='noreferrer'>
                https://www.ibm.com/community/z/open-source-software
              </a>
            </li>
            <li>
              <span className='bullet-icon'>•</span> The following are Linux distributions and the list of software is extracted from the
              public package lists for s390x, details of which are listed below.
              <ul>
                <li>
                  &#9643; <b>AlmaLinux:</b>{' '}
                  <a href='https://wiki.almalinux.org/repos/AlmaLinux.html' target='_blank' rel='noreferrer'>
                    https://wiki.almalinux.org/repos/AlmaLinux.html
                  </a>
                </li>
                <li>
                  &#9643; <b>ClefOS:</b>{' '}
                  <a href='https://www.sinenomine.net/offerings/linux/ClefOS' target='_blank' rel='noreferrer'>
                    https://www.sinenomine.net/offerings/linux/ClefOS
                  </a>
                </li>
                <li>
                  &#9643; <b>Debian:</b>{' '}
                  <a href='https://www.debian.org/distrib/packages' target='_blank' rel='noreferrer'>
                    https://www.debian.org/distrib/packages
                  </a>
                </li>
                <li>
                  &#9643; <b>Fedora:</b>{' '}
                  <a href='https://packages.fedoraproject.org/' target='_blank' rel='noreferrer'>
                    https://packages.fedoraproject.org/
                  </a>
                </li>
                <li>
                  &#9643; <b>OpenSUSE:</b>{' '}
                  <a href='https://en.opensuse.org/Package_repositories' target='_blank' rel='noreferrer'>
                    https://en.opensuse.org/Package_repositories
                  </a>
                </li>
                <li>
                  &#9643; <b>Rocky Linux:</b>{' '}
                  <a href='https://wiki.rockylinux.org/rocky/repo/' target='_blank' rel='noreferrer'>
                    https://wiki.rockylinux.org/rocky/repo/
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <span className='bullet-icon'>•</span> The following are Linux distribution whose data is pulled from the{' '}
              <a href='https://github.com/Linux-on-ibm-z/PDS/' target='_blank' rel='noreferrer'>
                PDS project
              </a>
              , which is maintained by the open source ecosystem porting team at IBM.
              <ul>
                <li>
                  <b>&#9643; RHEL (Red Hat Enterprise Linux)</b>
                </li>
                <li>
                  <b>&#9643; SUSE Package Hub SLES</b>
                </li>
                <li>
                  <b>&#9643; Suse Linux Enterprise Server</b>
                </li>
                <li>
                  <b>&#9643; Ubuntu</b>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5em', fontWeight: 'bold' }}>z/OS</h1>
          <ul>
            <li>
              <span className='bullet-icon'>•</span> <b>IBM z/OS (General):</b> This is a collection of manually curated open source
              software that has been discovered for z/OS, but doesn’t neatly fit into any other category or source. In the future, this will
              be split out into more specific areas.
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    que: 'Does Software Discovery Tool list the packages for all architectures?',
    ans: <p>No. The packages that Software Discovery Tool lists are for s390x architecture.</p>
  },
  {
    id: 5,
    que: 'What is the format for entering the search keywords?',
    ans: (
      <div>
        The keyword must be three or more characters.
        <ul>
          <li>
            <span className='bullet-icon'>•</span> To search for a package that contains the keyword anywhere in its name, enter three or
            more characters
          </li>
          <li>
            <span className='bullet-icon'>•</span> To search for a package that contains the keyword at the end of its name, enter the
            asterisk character, followed by three or more characters. For example, enter <b>*docker</b> to search for package names that end
            with the string <b>docker</b>.
          </li>
          <li>
            <span className='bullet-icon'>•</span> To search for a package that contains the keyword at the beginning of its name, enter
            three or more characters followed by the asterisk character. For example, enter <b>docker*</b> to search for package names that
            begin with the string <b>docker</b>.
          </li>
          <li>
            <span className='bullet-icon'>•</span> To search for package names that exactly match the keyword, enter three or more
            characters, and then click the <b>Search (Exact Match)</b> hyperlink.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 6,
    que: 'How can I narrow my search?',
    ans: (
      <p>
        To get packages which exactly matches the search keyword, click on the hyperlink "Search &lt;keyword&gt; (Exact Match)" after
        entering search keyword
      </p>
    )
  },
  {
    id: 7,
    que: 'How can I refine my search results?',
    ans: (
      <div>
        <p>
          For every successful search, Software Discovery Tool displays a panel next to the results grid. You may enter a few characters of
          Package Name or Version in the 'Refine your results' text box and the results will be filtered automatically as you type.
        </p>

        <p>
          Similarly you may select or unselect the specific Distro Versions under "Filter distribution" to locate the necessary package.
        </p>

        <p>
          With each distro version, Software Discovery Tool displays count of displayed packages and total packages found per Distro Version
          for your help.
        </p>
      </div>
    )
  },
  {
    id: 8,
    que: 'What package details does Software Discovery Tool display in the search results?',
    ans: (
      <div>
        Software Discovery Tool displays the following package details in the search results:
        <ul>
          <li>
            <span className='bullet-icon'>•</span> Package Name
          </li>
          <li>
            <span className='bullet-icon'>•</span> Package Version
          </li>
          <li>
            <span className='bullet-icon'>•</span> Package Description
          </li>
          <li>
            <span className='bullet-icon'>•</span> Operating system for which the package is available
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 9,
    que: 'How accurate is the package information that Software Discovery Tool provides?',
    ans: (
      <p>
        The package information is regularly updated. It is accurate as on the date of the update. The z/OS software list and the other
        operating systems software lists are maintained by the community in the{' '}
        <a href='https://github.com/openmainframeproject/software-discovery-tool-data' target='_blank' rel='noreferrer'>
          Software Discovery Tool Data Repository
        </a>
        .
      </p>
    )
  },
  {
    id: 10,
    que: 'Where can I find more information on running open source packages on z/OS and other Linux distributions?',
    ans: (
      <div>
        More information on some of the open source work being done can be found in The{' '}
        <a href='https://openmainframeproject.org/' target='_blank' rel='noreferrer'>
          Open Mainframe Project
        </a>{' '}
        and you can learn more and join the discussion around packages that have been ported and/or validated on corresponding distro
        versions by{' '}
        <a href='https://www.ibm.com/community/z/open-source/' target='_blank' rel='noreferrer'>
          IBM in the IBM Community for Open Source on IBM Z and LinuxONE
        </a>
        .
      </div>
    )
  }
]
