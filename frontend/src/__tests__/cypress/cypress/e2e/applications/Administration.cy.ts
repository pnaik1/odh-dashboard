import { mockRoleBindingK8sResource } from '~/__mocks__/mockRoleBindingK8sResource';
import { mockK8sResourceList } from '~/__mocks__';
import { RoleBindingSubject } from '~/types';
import { mockAllowedUsers } from '~/__mocks__/mockAllowedUsers';
import { mockNotebookImageInfo } from '~/__mocks__/mockNotebookImageInfo';
import {
  administration,
  notebookController,
} from '~/__tests__/cypress/cypress/pages/administration';
import { be } from '~/__tests__/cypress/cypress/utils/should';
import { asProductAdminUser, asProjectEditUser } from '~/__tests__/cypress/cypress/utils/users';

const groupSubjects: RoleBindingSubject[] = [
  {
    kind: 'Group',
    apiGroup: 'rbac.authorization.k8s.io',
    name: 'group-1',
  },
];

const initIntercepts = () => {
  cy.interceptOdh('GET /api/status/openshift-ai-notebooks/allowedUsers', [
    mockAllowedUsers({}),
    mockAllowedUsers({ username: 'regularuser1' }),
  ]);
  cy.interceptOdh(
    'GET /api/rolebindings/opendatahub/openshift-ai-notebooks-image-pullers',
    mockK8sResourceList([
      mockRoleBindingK8sResource({
        name: 'group-1',
        subjects: groupSubjects,
        roleRefName: 'edit',
      }),
    ]),
  );
  cy.interceptOdh('GET /api/images/:type', { path: { type: 'jupyter' } }, mockNotebookImageInfo());
};

it('Administartion tab should not be accessible for non-project admins', () => {
  initIntercepts();
  asProjectEditUser();
  notebookController.visit();
  notebookController.findAdministrationTab().should('not.exist');
  notebookController.findSpawnerTab().should('not.exist');
  notebookController.findAppTitle().should('contain', 'Start a notebook server');
});

describe('Administration Tab', () => {
  beforeEach(() => {
    initIntercepts();
    asProductAdminUser();
    notebookController.visit();
    notebookController.findAdministrationTab().click();
  });

  it('Check table with users details', () => {
    administration.shouldHaveManageUsersAlert();
    administration.findStopAllServersButton().should('be.disabled');
    const userRow = administration.getRow('test-user');
    userRow.shouldHavePrivilege('User');
    userRow.shouldHaveLastActivity('2 months ago');
  });

  it('Users table sorting', () => {
    // By user
    administration.findTableHeaderButton('User').click();
    administration.findTableHeaderButton('User').should(be.sortDescending);
    administration.findTableHeaderButton('User').click();
    administration.findTableHeaderButton('User').should(be.sortAscending);

    // By privilege
    administration.findTableHeaderButton('Privilege').click();
    administration.findTableHeaderButton('Privilege').should(be.sortAscending);
    administration.findTableHeaderButton('Privilege').click();
    administration.findTableHeaderButton('Privilege').should(be.sortDescending);

    // By last activity
    administration.findTableHeaderButton('Last activity').click();
    administration.findTableHeaderButton('Last activity').should(be.sortAscending);
    administration.findTableHeaderButton('Last activity').click();
    administration.findTableHeaderButton('Last activity').should(be.sortDescending);

    // By server status
    administration.findTableHeaderButton('Server status').click();
    administration.findTableHeaderButton('Server status').should(be.sortAscending);
    administration.findTableHeaderButton('Server status').click();
    administration.findTableHeaderButton('Server status').should(be.sortDescending);
  });

  it('Validate that clicking on "Start server" button will open a form in administartion tab and "Start your server" button will navigate to notebook server tab', () => {
    let userRow = administration.getRow('regularuser1');

    // open a form in administartion tab with impersonate alert
    userRow.findServerStatusButton().click();
    administration.shouldHaveImpersonateAlert();
    administration.shouldHaveNotebookServerForm();
    administration.findImageSelectorRadio('code-server-notebook').should('be.checked');
    administration.findStartServerButton().should('be.enabled');
    administration.findReturnToAdminViewButton().click();

    // Navigate to notebook server tab
    userRow = administration.getRow('test-user');
    userRow.findServerStatusButton().click();
    notebookController.findAppTitle().should('contain', 'Start a notebook server');
    notebookController.findAppTitle().should('not.contain', 'Administration');
  });
});
