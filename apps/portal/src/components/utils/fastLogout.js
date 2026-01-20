import { fastLogout as sharedFastLogout } from '@ifs/shared/utils';

export const fastLogout = () => {
    console.log('FASTLOGOUT CALLED');
    sharedFastLogout();
};
